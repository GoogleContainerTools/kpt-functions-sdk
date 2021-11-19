/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ArgumentParser, RawTextHelpFormatter } from 'argparse';
import { FileFormat, readConfigs, writeConfigs } from './io';
import { KptFunc, KubernetesObject, Configs } from './types';
import { FunctionConfigError } from './errors';
import {
  getAnnotation,
  addAnnotation,
  removeAnnotation,
  SOURCE_PATH_ANNOTATION,
  SOURCE_INDEX_ANNOTATION,
  ID_ANNOTATION,
  LEGACY_SOURCE_PATH_ANNOTATION,
  LEGACY_SOURCE_INDEX_ANNOTATION,
  LEGACY_ID_ANNOTATION,
  ANNOTATION_PREFIX,
} from './metadata';

const INVOCATIONS = `
Example invocations:

  1. Using regular files for input and output:

    $ FUNC -i in.yaml -o out.yaml

  2. Print output to stdout:

    $ FUNC -i in.yaml

  3. Using redirection:

    $ FUNC < in.yaml > out.yaml

  4. Using pipes:

    $ cat in.yaml | FUNC | cat

  5. Using /dev/null for source/sink functions:

    $ FUNC -i /dev/null -o /dev/null

  6. Specifying 'functionConfig' as a separate file:
  
    $ cat in.yaml | FUNC -f fc.yaml

    If the input contains 'functionConfig' field, it will be ignored.

  7. Specifying 'functionConfig' using key/value literals:
  
    $ cat in.yaml | FUNC -d key1=value1 -d key2=value2

    This is a convenient way to populate the functionConfig if it's a ConfigMap.
`;

const RESOURCE_ID_ANNOTATION =
  'internal.kubernetes.io/annotations-migration-resource-id';

enum ExitCode {
  RESULT_ERROR = 1,
  EXCEPTION_ERROR,
  FUNCTION_CONFIG_ERROR,
}

/**
 * This is the main entrypoint for running a kpt function.
 *
 * This method does not throw any errors and can be invoked at the top-level without getting
 * an unhandled promise rejection error.
 */
export async function run(fn: KptFunc) {
  try {
    await runFn(fn);
  } catch (err) {
    if (err instanceof ResultError) {
      process.exitCode = ExitCode.RESULT_ERROR;
    } else if (err instanceof FunctionConfigError) {
      console.error(err.toString());
      process.exitCode = ExitCode.FUNCTION_CONFIG_ERROR;
    } else {
      console.error((err as Error).stack);
      process.exitCode = ExitCode.EXCEPTION_ERROR;
    }
  }
}

async function runFn(fn: KptFunc) {
  // Build the parser.
  const parser = new ArgumentParser({
    // Used as placeholder name for all functions.
    prog: 'FUNC',
    addHelp: true,
    description: `${fn.usage}

${INVOCATIONS}`,
    formatterClass: RawTextHelpFormatter,
  });
  parser.addArgument(['-i', '--input'], {
    help: 'Path to the input file (if not reading from stdin)',
  });
  parser.addArgument(['-o', '--output'], {
    help: 'Path to the output file (if not writing to stdout)',
  });
  parser.addArgument(['-f', '--function-config'], {
    help: 'Path to the function configuration file. If specified, ignores "functionConfig" field in the input',
  });
  parser.addArgument(['-d', '--function-config-literal'], {
    help: `Specify a key and literal value (i.e. mykey=somevalue) to populate a ConfigMap instead of
specifying a file using --function-config.
Use this ONLY if the function accepts a ConfigMap.`,
    action: 'append',
    nargs: '*',
  });
  parser.addArgument('--json', {
    action: 'storeTrue',
    help: 'Input and output files are in JSON instead of YAML',
  });
  parser.addArgument('--log-to-stderr', {
    action: 'storeTrue',
    help: 'Emit structured results to stderr in addition to setting".results" field in stdout',
  });

  // Parse args.
  const args = new Map<string, any>(Object.entries(parser.parseArgs()));
  const fileFormat = Boolean(args.get('json'))
    ? FileFormat.JSON
    : FileFormat.YAML;
  const inputFile = args.get('input') || '/dev/stdin';
  const outputFile = args.get('output') || '/dev/stdout';
  let functionConfig: string | KubernetesObject | undefined =
    args.get('function_config');
  const functionConfigLiterals = args.get('function_config_literal');
  if (functionConfigLiterals) {
    if (functionConfig) {
      parser.error(
        '--function-config and --function-config-literal are mutually exclusive'
      );
    }
    functionConfig = parseToConfigMap(parser, functionConfigLiterals);
  }
  const logToStdErr =
    process.env.LOG_TO_STDERR !== undefined ||
    Boolean(args.get('log_to_stderr'));

  // Read the input and construct Configs.
  const configs = await readConfigs(inputFile, fileFormat, functionConfig);
  configs.logToStdErr = logToStdErr;

  await runFnWithConfigs(fn, configs);

  // Write the output.
  await writeConfigs(outputFile, configs, fileFormat);

  for (const r of configs.getResults()) {
    if (r.severity === 'error') {
      throw new ResultError();
    }
  }
}

export async function runFnWithConfigs(fn: KptFunc, configs: Configs) {
  // Save the original annotation values.
  const m = preprocessResourceForInternalAnnotationsMigration(configs);

  // Run the function.
  await fn(configs);

  // Reconcile the legacy and the new annotations by comparing them with the original value.
  reconcileAnnotations(configs, m);
}

function getInternalAnnotations(obj: KubernetesObject): {
  [key: string]: string;
} {
  const m: { [index: string]: string } = {};
  if (!obj.metadata) {
    return m;
  }
  if (!obj.metadata.annotations) {
    return m;
  }
  for (const key in obj.metadata.annotations) {
    if (
      key.startsWith(ANNOTATION_PREFIX) ||
      key === LEGACY_SOURCE_PATH_ANNOTATION ||
      key === LEGACY_SOURCE_INDEX_ANNOTATION ||
      key === LEGACY_ID_ANNOTATION
    ) {
      m[key] = obj.metadata.annotations[key];
    }
  }
  return m;
}

function preprocessResourceForInternalAnnotationsMigration(
  configs: Configs
): Map<string, { [key: string]: string }> {
  const m = new Map();
  let id = 0;
  for (const obj of configs.getAll()) {
    const idStr = id.toString();
    addAnnotation(obj, RESOURCE_ID_ANNOTATION, idStr);
    m.set(idStr, getInternalAnnotations(obj));
    id++;

    checkMismatchAnnos(obj.metadata.annotations);
  }
  return m;
}

function checkMismatchAnnos(
  annotations: { [key: string]: string } | undefined
) {
  if (!annotations) {
    return;
  }
  const path = annotations[SOURCE_PATH_ANNOTATION];
  const legacyPath = annotations[LEGACY_SOURCE_PATH_ANNOTATION];
  if (path && legacyPath && path !== legacyPath) {
    throw new AnnotationsValueMismatchError();
  }

  const index = annotations[SOURCE_INDEX_ANNOTATION];
  const legacyIndex = annotations[LEGACY_SOURCE_INDEX_ANNOTATION];
  if (index && legacyIndex && index !== legacyIndex) {
    throw new AnnotationsValueMismatchError();
  }

  const id = annotations[ID_ANNOTATION];
  const legacyId = annotations[LEGACY_ID_ANNOTATION];
  if (id && legacyId && id !== legacyId) {
    throw new AnnotationsValueMismatchError();
  }
}

// determineAnnotationFormat returns 2 values:
// - if the internal format should be used.
// - if the legacy format should be used.
function determineAnnotationFormat(
  m: Map<string, { [key: string]: string }>
): [boolean, boolean] {
  if (m.size === 0) {
    return [true, true];
  }
  let internal: boolean | undefined, legacy: boolean | undefined;
  for (const [, annotations] of m) {
    const path = annotations[SOURCE_PATH_ANNOTATION];
    const index = annotations[SOURCE_INDEX_ANNOTATION];
    const id = annotations[ID_ANNOTATION];
    const foundOneOf =
      path !== undefined || index !== undefined || id !== undefined;
    if (!internal) {
      internal = foundOneOf;
    }
    if ((foundOneOf && !internal) || (!foundOneOf && internal)) {
      throw new AnnotationsFormatMismatchError();
    }

    const legacyPath = annotations[LEGACY_SOURCE_PATH_ANNOTATION];
    const legacyIndex = annotations[LEGACY_SOURCE_INDEX_ANNOTATION];
    const legacyId = annotations[LEGACY_ID_ANNOTATION];
    const foundOneOfLegacy =
      legacyPath !== undefined ||
      legacyIndex !== undefined ||
      legacyId !== undefined;
    if (!legacy) {
      legacy = foundOneOfLegacy;
    }
    if ((foundOneOfLegacy && !legacy) || (!foundOneOfLegacy && legacy)) {
      throw new AnnotationsFormatMismatchError();
    }
  }
  if (internal !== undefined && legacy !== undefined) {
    return [internal, legacy];
  }
  return [true, true];
}

function setMissingAnnotations(obj: KubernetesObject) {
  setMissingAnnotation(
    obj,
    SOURCE_PATH_ANNOTATION,
    LEGACY_SOURCE_PATH_ANNOTATION
  );
  setMissingAnnotation(
    obj,
    SOURCE_INDEX_ANNOTATION,
    LEGACY_SOURCE_INDEX_ANNOTATION
  );
  setMissingAnnotation(obj, ID_ANNOTATION, LEGACY_ID_ANNOTATION);
}

function setMissingAnnotation(
  obj: KubernetesObject,
  internalKey: string,
  legacyKey: string
) {
  const internalVal = getAnnotation(obj, internalKey);
  const legacyVal = getAnnotation(obj, legacyKey);
  if (!internalVal && !legacyVal) {
    return;
  } else if (!internalVal && legacyVal) {
    addAnnotation(obj, internalKey, legacyVal);
  } else if (!legacyVal && internalVal) {
    addAnnotation(obj, legacyKey, internalVal);
  }
}

function checkAnnotationsAltered(
  obj: KubernetesObject,
  idToAnnos: Map<string, { [key: string]: string }>
) {
  const path = getAnnotation(obj, SOURCE_PATH_ANNOTATION);
  const index = getAnnotation(obj, SOURCE_INDEX_ANNOTATION);
  const legacyPath = getAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION);
  const legacyIndex = getAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION);

  const rid = getAnnotation(obj, RESOURCE_ID_ANNOTATION);
  if (!rid) {
    return;
  }
  const originalAnnotations = idToAnnos.get(rid);
  if (!originalAnnotations) {
    return;
  }

  let originalPath = originalAnnotations[SOURCE_PATH_ANNOTATION];
  if (!originalPath) {
    originalPath = originalAnnotations[LEGACY_SOURCE_PATH_ANNOTATION];
  }
  if (originalPath) {
    if (
      path &&
      legacyPath &&
      originalPath !== path &&
      originalPath !== legacyPath &&
      path !== legacyPath
    ) {
      throw new AnnotationsValueMismatchError();
    } else if (path && originalPath !== path) {
      addAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION, path);
    } else if (legacyPath && originalPath !== legacyPath) {
      addAnnotation(obj, SOURCE_PATH_ANNOTATION, legacyPath);
    }
  }

  let originalIndex = originalAnnotations[SOURCE_INDEX_ANNOTATION];
  if (!originalIndex) {
    originalIndex = originalAnnotations[LEGACY_SOURCE_INDEX_ANNOTATION];
  }
  if (originalIndex) {
    if (
      index &&
      legacyIndex &&
      originalIndex !== index &&
      originalIndex !== legacyIndex &&
      index !== legacyIndex
    ) {
      throw new AnnotationsValueMismatchError();
    } else if (index && originalIndex !== index) {
      addAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION, index);
    } else if (legacyIndex && originalIndex !== legacyIndex) {
      addAnnotation(obj, SOURCE_INDEX_ANNOTATION, legacyIndex);
    }
  }
}

function formatInternalAnnotations(
  obj: KubernetesObject,
  useInternal: boolean,
  useLegacy: boolean
) {
  if (!useInternal) {
    removeAnnotation(obj, SOURCE_PATH_ANNOTATION);
    removeAnnotation(obj, SOURCE_INDEX_ANNOTATION);
    removeAnnotation(obj, ID_ANNOTATION);
  }
  if (!useLegacy) {
    removeAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION);
    removeAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION);
    removeAnnotation(obj, LEGACY_ID_ANNOTATION);
  }
}

function reconcileAnnotations(
  configs: Configs,
  m: Map<string, { [key: string]: string }>
) {
  const [useInternal, useLegacy] = determineAnnotationFormat(m);

  for (const obj of configs.getAll()) {
    setMissingAnnotations(obj);
    checkAnnotationsAltered(obj, m);
    formatInternalAnnotations(obj, useInternal, useLegacy);
    checkMismatchAnnos(obj.metadata.annotations);
    removeAnnotation(obj, RESOURCE_ID_ANNOTATION);
  }
}

class AnnotationsValueMismatchError extends Error {
  constructor() {
    super('the legacy and internal annotation values mismatch');
  }
}

class AnnotationsFormatMismatchError extends Error {
  constructor() {
    super('the legacy and internal annotation formats mismatch');
  }
}

class ResultError extends Error {
  constructor() {
    super('Function returned a Result of error or higher');
  }
}

function parseToConfigMap(
  parser: ArgumentParser,
  args: string[][]
): KubernetesObject {
  const cm: any = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: 'config',
    },
    data: {},
  };
  for (const a of args) {
    if (a.length !== 1) {
      parser.error(
        'Exactly one value is required for --function-config-literal'
      );
    }
    const kv = a[0].split('=');
    if (kv.length !== 2) {
      parser.error(`Invalid value ${a[0]}, expected key=value`);
    }
    cm.data[kv[0]] = kv[1];
  }
  return cm as KubernetesObject;
}
