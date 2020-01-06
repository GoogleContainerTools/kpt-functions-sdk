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
import { KptFunc, KubernetesObject } from './types';
import { ConfigError } from './errors';

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

enum ExitCode {
  CONFIG_ERROR = 1,
  EXCEPTION_ERROR,
}

/**
 * Executes the KptFunc. This is the main entrypoint for all kpt functions.
 */
export function run(fn: KptFunc) {
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
    help:
      'Path to the function configuration file. If specified, ignores "functionConfig" field in the input',
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

  // Parse args.
  const args = new Map(Object.entries(parser.parseArgs()));
  const fileFormat = Boolean(args.get('json')) ? FileFormat.JSON : FileFormat.YAML;
  const inputFile = args.get('input') || '/dev/stdin';
  const outputFile = args.get('output') || '/dev/stdout';
  let functionConfig: string | KubernetesObject | undefined = args.get('function_config');
  const functionConfigLiterals = args.get('function_config_literal');
  if (functionConfigLiterals) {
    if (functionConfig) {
      parser.error('--function-config and --function-config-literal are mutually exclusive');
    }
    functionConfig = parseToConfigMap(parser, functionConfigLiterals);
  }

  try {
    runFn(fn, inputFile, outputFile, fileFormat, functionConfig);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(err.toString());
      process.exitCode = ExitCode.CONFIG_ERROR;
    } else {
      console.error(err.stack);
      process.exitCode = ExitCode.EXCEPTION_ERROR;
    }
  }
}

function runFn(
  fn: KptFunc,
  inputFile: string,
  outputFile: string,
  fileFormat: FileFormat,
  functionConfig?: string | KubernetesObject
) {
  // Parse Config.
  const configs = readConfigs(inputFile, fileFormat, functionConfig);

  // Run the function.
  const err = fn(configs);
  if (err) {
    throw err;
  }

  // Write output.
  writeConfigs(outputFile, configs, fileFormat);
}

function parseToConfigMap(parser: ArgumentParser, args: string[][]): KubernetesObject {
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
      parser.error('Exactly one value is required for --function-config-literal');
    }
    const kv = a[0].split('=');
    if (kv.length !== 2) {
      parser.error(`Invalid value ${a[0]}, expected key=value`);
    }
    cm.data[kv[0]] = kv[1];
  }
  return cm as KubernetesObject;
}
