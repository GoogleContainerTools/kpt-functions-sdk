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

import { KubernetesObject } from './types';
import { SOURCE_PATH_ANNOTATION, getAnnotation } from './metadata';

/**
 * Base class that represent a configuration-related error.
 *
 * Typically you should use one of the more specific child classes.
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Wraps multiple ConfigError objects.
 */
export class MultiConfigError extends ConfigError {
  public readonly errors: ConfigError[];

  constructor(message: string, errors: ConfigError[]) {
    super(message);
    this.name = 'MultiConfigErrors';
    this.errors = errors;
  }

  push(error: ConfigError) {
    this.errors.push(error);
  }

  toString(): string {
    const e = this.errors
      .map((e, i) => `[${i + 1}] ${e}`)
      .sort()
      .join('\n');
    return `${this.name}: ${this.message}\n\n${e}`;
  }
}

/**
 * Represents an error with a configuration file.
 */
export class ConfigFileError extends ConfigError {
  constructor(message: string, public readonly path: string) {
    super(message);
    this.name = 'ConfigFileError';
  }

  toString(): string {
    return `${this.name}: ${this.message} in file ${this.path}`;
  }
}

/**
 * Represents an error with a KubernetesObject.
 */
export class KubernetesObjectError extends ConfigError {
  constructor(message: string, public readonly object: KubernetesObject) {
    super(message);
    this.name = 'KubernetesObjectError';
  }

  toString(): string {
    const path = getAnnotation(this.object, SOURCE_PATH_ANNOTATION) || 'No path annotation';
    const namespace = this.object.metadata.namespace || '';
    return `${this.name}: ${this.message}
path: ${path}
apiVersion: "${this.object.apiVersion}"
kind: "${this.object.kind}"
metadata.namespace: "${namespace}"
metadata.name: "${this.object.metadata.name}"
`;
  }
}
