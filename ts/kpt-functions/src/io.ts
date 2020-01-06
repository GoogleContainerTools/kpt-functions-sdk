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

import * as fs from 'fs';
import { DumpOptions, safeDump, safeLoad } from 'js-yaml';
import * as rw from 'rw';
import { Configs, KubernetesObject } from './types';

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
};

/**
 * Reads an input file as defined in Configuration Functions spec and constructs a Configs object.
 *
 * @param input Path to input file.
 * @param format File format
 * @param functionConfig Either a path to the functionConfig file containing the object or the object itself.
 */
export function readConfigs(
  input: FilePath,
  format: FileFormat,
  functionConfig?: FilePath | KubernetesObject
): Configs {
  let inputRaw: string;

  switch (input) {
    case '/dev/null':
      inputRaw = '{"items":[]}';
      break;
    case '/dev/stdin':
      if (process.stdin.isTTY) {
        throw new Error('Cannot read input. Need either stdin or --input file');
      }
      if (!fs.existsSync(input)) {
        throw new Error(`Input file does not exist: ${input}`);
      }
      inputRaw = rw.readFileSync(input, 'utf8');
      break;
    default:
      if (!fs.existsSync(input)) {
        throw new Error(`Input file does not exist: ${input}`);
      }
      inputRaw = rw.readFileSync(input, 'utf8');
  }

  let functionConfigRaw: string | KubernetesObject | undefined;
  if (typeof functionConfig === 'string') {
    if (!fs.existsSync(functionConfig)) {
      throw new Error(`functionConfig file does not exist: ${functionConfig}`);
    }
    functionConfigRaw = rw.readFileSync(functionConfig, 'utf8');
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

  // TODO(b/144499462): Throw error if missing apiVersion/kind/items?
  return new Configs(i.items, f || i.functionConfig);
}

function load(raw: string, format: FileFormat): any {
  switch (format) {
    case FileFormat.JSON:
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
 * @param format defines whether to write the Configs as YAML or JSON.
 */
export function writeConfigs(output: FilePath, configs: Configs, format: FileFormat): void {
  if (output === '/dev/null') {
    return;
  }

  rw.writeFileSync(output, stringify(configs, format), 'utf8');
}

/**
 * Stringifies Configs object to raw data.
 *
 * @param configs The configs to convert to a string.
 * @param format defines whether to write the configs as YAML or JSON.
 */
export function stringify(configs: Configs, format: FileFormat): string {
  const output = {
    apiVersion: 'v1',
    kind: 'List',
    items: configs.getAll(),
  };

  switch (format) {
    case FileFormat.JSON:
      return JSON.stringify(output, undefined, 2) + '\n';
    case FileFormat.YAML:
      return safeDump(output, YAML_STYLE);
    default:
      throw new Error(`Unsupported file format ${format}`);
  }
}
