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
import { KptFunc, isConfigError, KubernetesObject } from './types';

const INVOCATIONS = `
Example invocations:

  1. Using regular files:

  $ FUNC --input in.yaml --output out.yaml

  2. Print to stdout:

  $ FUNC --input in.yaml

  3. Using redirection:

  $ FUNC < in.yaml > out.yaml

  4. Using pipes:

  $ cat in.yaml | FUNC | cat

  5. Using /dev/null for source/sink use cases:

  $ FUNC --input /dev/null --output /dev/null

  6. Overriding 'functionConfig' field using a separate file:
  
  --functionConfig can be used to override 'functionConfig' field in the input file:

  $ cat in.yaml | FUNC --function-config run1.yaml
  $ cat in.yaml | FUNC --function-config run2.yaml

  7. Overriding 'functionConfig' filed using key/value literals:
  
  A convinient way to populate the functionConfig if it's a ConfigMap.

  $ cat in.yaml | FUNC --function-config-literal=key1=value1 --function-config-literal=key2=value2 
`;
const CONFIG_ERROR_EXIT_CODE = 1;

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
  let args = new Map(Object.entries(parser.parseArgs()));
  let fileFormat = Boolean(args.get('json')) ? FileFormat.JSON : FileFormat.YAML;
  let inputFile = args.get('input') || '/dev/stdin';
  let outputFile = args.get('output') || '/dev/stdout';
  let functionConfig: string | KubernetesObject | undefined = args.get('function_config');
  let functionConfigLiterals = args.get('function_config_literal');
  if (functionConfigLiterals) {
    if (functionConfig) {
      parser.error('--function-config and --function-config-literal are mutually exclusive');
    }
    functionConfig = parseToConfigMap(parser, functionConfigLiterals);
  }

  // Parse Config.
  let configs = readConfigs(inputFile, fileFormat, functionConfig);
  if (isConfigError(configs)) {
    configs.log();
    process.exitCode = CONFIG_ERROR_EXIT_CODE;
    return;
  }

  // Run the function.
  const funcErr = fn(configs);
  if (isConfigError(funcErr)) {
    funcErr.log();
    process.exitCode = CONFIG_ERROR_EXIT_CODE;
    return;
  }

  // Write output.
  // TODO(frankf): When writing to stdout, the function MUST NOT pollute the stdout by e.g. using
  // the global console.log. Explore the best way to handle this pitfall.
  // One possible solution: Framework provides a logger that prints to stderr.
  writeConfigs(outputFile, configs, fileFormat);
}

function parseToConfigMap(parser: ArgumentParser, args: string[][]): KubernetesObject {
  let cm: any = {
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
