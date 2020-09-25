/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DumpOptions, safeDump, safeLoad } from 'js-yaml';
import rw from 'rw';
import { Configs, KubernetesObject } from './types';

// Stdout is used for chaining functions so override global console object to send output to stderr.
// eslint-disable-next-line no-global-assign
console = new console.Console(process.stderr, process.stderr);

export enum FileFormat {
  YAML,
  JSON,
}
type FilePath = string;
const YAML_STYLE: DumpOptions = {
  // indentation width to use (in spaces).
  indent: 2,
  // when true, will not add an indentation level to array elements.
  noArrayIndent: true,
  // 'undefined' is an invalid value for safeDump.
  // TODO(frankf): Explore ways to make this safer.
  // Either reason about not having 'undefined' in all cases OR
  // only skip 'undefined'.
  skipInvalid: true,
  // unset lineWidth from default of 80 to avoid reformatting
  lineWidth: -1,
  // avoid refs because many YAML parsers in the k8s ecosystem don't support them
  noRefs: true,
};

/**
 * Reads an input file as defined in Configuration Functions spec and constructs a Configs object.
 *
 * @param input Path to input file.
 * @param format File format
 * @param functionConfig Either a path to the functionConfig file containing the object or the object itself.
 */
export async function readConfigs(
  input: FilePath,
  format: FileFormat,
  functionConfig?: FilePath | KubernetesObject
): Promise<Configs> {
  let inputRaw: string;
  if (input === '/dev/null') {
    inputRaw = '{"items":[]}';
  } else {
    if (input === '/dev/stdin' && process.stdin.isTTY) {
      throw new Error('Cannot read input. Need either stdin or --input file');
    }
    inputRaw = await readFile(input);
  }

  let functionConfigRaw: string | KubernetesObject | undefined;
  if (typeof functionConfig === 'string') {
    functionConfigRaw = await readFile(functionConfig);
  } else {
    functionConfigRaw = functionConfig;
  }

  return parse(inputRaw, format, functionConfigRaw);
}

/**
 * Parses stringified data and constructs a Configs object.
 *
 * @param input Stringified input objects.
 * @param format defines whether to parse the Configs as YAML or JSON.
 * @param functionConfig Either stringified functionConfig object or the object itself.
 */
export function parse(
  input: string,
  format: FileFormat,
  functionConfig?: string | KubernetesObject
): Configs {
  const i = load(input, format);
  let f;
  if (typeof functionConfig === 'string') {
    f = load(functionConfig, format);
  } else {
    f = functionConfig;
  }

  return new Configs(i.items, f || i.functionConfig);
}

function load(raw: string, format: FileFormat): any {
  switch (format) {
    case FileFormat.JSON:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(raw);
    case FileFormat.YAML:
      // safeLoad returns undefined if raw is empty string.
      return safeLoad(raw) || {};
    default:
      throw new Error(`Unsupported file format ${format}`);
  }
}

/**
 * Writes an output file as defined in Configuration Functions spec.
 *
 * @param output Path to to the file to be created, it must not exist.
 * @param configs Contains objects to write to the output file.
 * @param format Defines whether to write the Configs as YAML or JSON.
 */
export async function writeConfigs(
  output: FilePath,
  configs: Configs,
  format: FileFormat
): Promise<void> {
  if (output === '/dev/null') {
    return;
  }

  await writeFile(output, stringify(configs, format));
}

/**
 * Stringifies Configs object to raw data.
 *
 * @param configs The configs to convert to a string.
 * @param format defines whether to write the configs as YAML or JSON.
 */
export function stringify(configs: Configs, format: FileFormat): string {
  const output = configs.toResourceList();

  switch (format) {
    case FileFormat.JSON:
      return JSON.stringify(output, undefined, 2) + '\n';
    case FileFormat.YAML:
      return safeDump(output, YAML_STYLE);
    default:
      throw new Error(`Unsupported file format ${format}`);
  }
}

async function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    rw.readFile(path, 'utf8', (err: any, data: string) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

async function writeFile(path: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    rw.writeFile(path, data, 'utf8', (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
