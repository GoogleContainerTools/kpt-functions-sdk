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

import { ArgumentParser, ArgumentGroup, RawTextHelpFormatter } from 'argparse';
import { FileFormat, readConfigs, writeConfigs } from './io';
import { KptFunc, isConfigError, Param, Configs } from './types';

enum FunctionType {
  INTERMEDIATE,
  SOURCE,
  SINK,
}

const INVOCATIONS = `
Example invocations:

  1. Using regular files:

  FUNC --input in.yaml --output out.yaml --param1=value1 --param2=value2

  2. Print to stdout:

  FUNC --input in.yaml --param1=value1 --param2=value2

  3. Using redirection:

  FUNC --param1=value1 --param2=value2 < in.yaml > out.yaml

  4. Using pipes:

  cat in.yaml | FUNC --param1=value1 --param2=value2 | cat

  5. Using /dev/null for source/sink use cases:

  FUNC --input /dev/null --output /dev/null --param1=value1 --param2=value2

  6. No command line arguments provided, and params are given as part of the input:

  cat in.yaml | FUNC

  where 'functionConfig' is a top-level field in in.yaml and contains a 'data' field as such:

  functionConfig:
    ...
    data:
      param1: value1
      param2: value2

  Note that 'functionConfig' is ignored if there are any command line arguments provided.
`;

/**
 * Runs a kpt function.
 */
export class Runner {
  /**
   * Creates a new Runner for running the given KptFunc.
   *
   * @param fn KptFunc to run.
   * @param params Parameters passed to KptFunc. The Runner automatically creates a CLI flag for each parameter.
   */
  public static newFunc(fn: KptFunc, ...params: Array<string | Param>): Runner {
    return new Runner(fn, FunctionType.INTERMEDIATE, ...params);
  }

  /**
   * Creates a new Runner for running the given KptFunc.
   *
   * @param fn a source KptFunc to run.
   * @param params Parameters passed to KptFunc. The Runner automatically creates a CLI flag for each parameter.
   */
  public static newSource(fn: KptFunc, ...params: Array<string | Param>): Runner {
    return new Runner(fn, FunctionType.SOURCE, ...params);
  }

  /**
   * Creates a new Runner for running the given KptFunc.
   *
   * @param fn a sink KptFunc to run.
   * @param params Parameters passed to KptFunc. The Runner automatically creates a CLI flag for each parameter.
   */
  public static newSink(fn: KptFunc, ...params: Array<string | Param>): Runner {
    return new Runner(fn, FunctionType.SINK, ...params);
  }

  public readonly params: Param[];

  private constructor(
    private readonly fn: KptFunc,
    private readonly type: FunctionType,
    ...params: Array<string | Param>
  ) {
    this.params = params.map(toParam);
  }

  /**
   * Executes the Runner. This is the main entrypoint for all kpt functions.
   */
  public run() {
    // TODO(b/141210134): Used this generation of workflow cnfigs. For now, it's unused.
    this.type.toString();

    // Build the parser.
    const parser = new ArgumentParser({
      // Used as placeholder name for all functions.
      prog: 'FUNC',
      addHelp: true,
      description: `Runs ${this.fn.name} kpt function.

      ${INVOCATIONS}`,
      formatterClass: RawTextHelpFormatter,
    });
    const commonGroup = parser.addArgumentGroup({ title: 'Common options' });
    commonGroup.addArgument(['-i', '--input'], {
      help: 'Path to the input file (if not reading from stdin)',
    });
    commonGroup.addArgument(['-o', '--output'], {
      help: 'Path to the output file (if not writing to stdout)',
    });
    commonGroup.addArgument('--json', {
      action: 'storeTrue',
      help: 'Input and output files are in JSON instead of YAML',
    });
    const paramGroup = parser.addArgumentGroup({ title: 'Function Params' });
    this.params.forEach((p) => addParam(paramGroup, p));

    let configs;
    let paramValues;
    let fileFormat = FileFormat.YAML;
    let inputFile = '/dev/stdin';
    let outputFile = '/dev/stdout';

    // Parse params either from command line flags OR input file.
    if (process.argv.length > 2) {
      // Parse params from command line args.
      // If params are provided on the command line, params in the input file are ignored.
      paramValues = new Map(Object.entries(parser.parseArgs()));
      fileFormat = Boolean(paramValues.get('json')) ? FileFormat.JSON : FileFormat.YAML;
      inputFile = paramValues.get('input') || inputFile;
      outputFile = paramValues.get('output') || outputFile;
      configs = readConfigs(inputFile, fileFormat);
      if (isConfigError(configs)) {
        configs.log();
        process.exitCode = CONFIG_ERROR_EXIT_CODE;
        return;
      }
    } else {
      // Parse params from the input file.
      configs = readConfigs(inputFile, fileFormat);
      let args = [];
      for (const [k, v] of configs.params) {
        args.push(`--${k}`, v);
      }
      paramValues = new Map(Object.entries(parser.parseArgs(args)));
    }

    configs = new Configs(configs.getAll(), paramValues);

    // Run the function.
    const funcErr = this.fn(configs);
    if (isConfigError(funcErr)) {
      funcErr.log();
      process.exitCode = CONFIG_ERROR_EXIT_CODE;
      return;
    }

    // Write output.
    // TODO(frankf): When writing to stdout, the function cannot pollute the stdout by e.g. using
    // the global console.log. Explore the best way to handle this.
    // One possible solution: Framework provides a logger that prints to stderr.
    writeConfigs(outputFile, configs, fileFormat);
  }
}

function addParam(parser: ArgumentGroup, param: Param) {
  parser.addArgument([`--${param.name}`], param.options);
}

function toParam(param: string | Param): Param {
  if (typeof param === 'string') {
    param = new Param(param);
  }
  return param;
}

const CONFIG_ERROR_EXIT_CODE = 1;
