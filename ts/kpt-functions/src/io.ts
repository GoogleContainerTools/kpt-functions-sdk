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
import { Configs } from './types';

export enum FileFormat {
  YAML,
  JSON,
}

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
 * Reads Configs from the file with standard intermediate data format.
 */
export function readConfigs(inputFile: string, format: FileFormat): Configs {
  switch (inputFile) {
    case '/dev/null':
      return new Configs();
    case '/dev/stdin':
      if (process.stdin.isTTY) {
        throw new Error('Cannot read configs. Neither stdin or --input was provided.');
      }
      break;
    default:
      if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file does not exist: ${inputFile}`);
      }
  }

  const raw = rw.readFileSync(inputFile, 'utf8');
  return read(raw, format);
}

/**
 * @param raw The string to read Configs from.
 * @param format defines whether to parse the Configs as YAML or JSON.
 */
export function read(raw: string, format: FileFormat): Configs {
  let input;
  switch (format) {
    case FileFormat.JSON:
      input = JSON.parse(raw);
      break;
    case FileFormat.YAML:
      // safeLoad returns undefined if raw is empty string.
      input = safeLoad(raw) || {};
      break;
    default:
      throw new Error(`Unsupported file format ${format}`);
  }
  // TODO(b/144499462): Throw error if missing apiVersion/kind/items?

  const params = new Map(Object.entries((input.functionConfig && input.functionConfig.data) || {}));
  return new Configs(input.items, params);
}

/**
 * Writes Configs to the file with standard intermediate data format.
 *
 * @param outputFile Path to to the file to be created, it must not exist.
 * @param configs list of configs to write to the disk as a Kubernetes List.
 * @param format defines whether to write the Configs as YAML or JSON.
 */
export function writeConfigs(outputFile: string, configs: Configs, format: FileFormat): void {
  if (outputFile == '/dev/null') {
    return;
  }

  rw.writeFileSync(outputFile, write(configs, format), 'utf8');
}

/**
 * @param configs The configs to convert to a string.
 * @param format defines whether to write the configs as YAML or JSON.
 */
export function write(configs: Configs, format: FileFormat): string {
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
