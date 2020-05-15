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
import * as glob from 'glob';
import { safeLoadAll } from 'js-yaml';
import * as path from 'path';
import {
  Configs,
  isKubernetesObject,
  addAnnotation,
  configFileResult,
  SOURCE_PATH_ANNOTATION,
  SOURCE_INDEX_ANNOTATION,
  Result,
} from 'kpt-functions';

export const SOURCE_DIR = 'source_dir';
export const FILTER_INVALID = 'filter_invalid';

export async function readYaml(configs: Configs) {
  // Get the parameters.
  const sourceDir = configs.getFunctionConfigValueOrThrow(SOURCE_DIR);
  const ignoreInvalid =
    configs.getFunctionConfigValue(FILTER_INVALID) === 'true';

  // Discard any input objects since this is a source function.
  configs.deleteAll();

  // Only read files with YAML extensions. Other file types are ignored.
  const files = glob.sync(sourceDir + '/**/*.+(yaml|yml)');

  // Parse each file and convert it to a KubernetesObject.
  files
    .map(f => parseFile(configs, sourceDir, f, ignoreInvalid))
    .filter(result => result !== undefined)
    .forEach(result => configs.addResults(result as Result));
}

readYaml.usage = `
Reads a directory of kubernetes YAML configs recursively.

Configured using a ConfigMap with the following keys:

${SOURCE_DIR}: Path to the config directory to read.
${FILTER_INVALID}: [Optional] If 'true', ignores invalid Kubernetes objects instead of failing.

Example:

apiVersion: v1
kind: ConfigMap
data:
  ${SOURCE_DIR}: /path/to/source/dir
metadata:
  name: my-config
`;

function parseFile(
  configs: Configs,
  sourceDir: string,
  file: string,
  ignoreInvalid: boolean
): Result | undefined {
  const contents = readFileOrThrow(file);
  let objects = safeLoadAll(contents);

  // Filter for objects that are not KubernetesObject. This is conditional on 'ignoreValid' parameter.
  const invalidObjects: object[] = objects.filter(o => !isKubernetesObject(o));
  if (invalidObjects.length) {
    if (ignoreInvalid) {
      objects = objects.filter(o => isKubernetesObject(o));
    } else {
      return configFileResult(
        `File contains invalid Kubernetes objects '${JSON.stringify(
          invalidObjects
        )}'`,
        file
      );
    }
  }

  // Add the standard path and index annotations to preserve the filesystem hierarchy
  // and ordering within a file.
  objects.forEach((o, i) => {
    addAnnotation(o, SOURCE_PATH_ANNOTATION, path.relative(sourceDir, file));
    addAnnotation(o, SOURCE_INDEX_ANNOTATION, i.toString());
  });

  configs.insert(...objects);
  return;
}

function readFileOrThrow(f: string): string {
  try {
    return fs.readFileSync(f, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read file ${f}: ${err}`);
  }
}
