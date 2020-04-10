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

import { KubernetesObject, Issue, Severity } from './types';
import {
  SOURCE_INDEX_ANNOTATION,
  SOURCE_PATH_ANNOTATION,
  getAnnotation,
} from './metadata';

/**
 * Base class that represent a configuration issue.
 *
 * Typically you should use one of the more specific child classes.
 */
export class ConfigError extends Error {
  /**
   * @param message: Issue message.
   * @param severity: Severity of this issue.
   * @param tags: Additional metadata about this issue.
   */
  constructor(
    message: string,
    readonly severity: Severity = 'error',
    readonly tags?: { [key: string]: string }
  ) {
    super(message);
    this.name = 'ConfigError';
  }

  /**
   * Structured representation of the issue.
   */
  toIssues(): Issue[] {
    return [
      {
        message: this.message,
        severity: this.severity,
        tags: this.tags,
      },
    ];
  }

  /**
   * String representation of the issue.
   */
  toString(): string {
    return `${this.name}: ${this.message} (${this.severity})`;
  }

  /**
   * Logs issue to stderr.
   */
  log() {
    console.error(this.toString());
  }
}

/**
 * Represents an issue with a configuration file.
 */
export class ConfigFileError extends ConfigError {
  /**
   * @param message: Issue message.
   * @param path: OS agnostic, relative, slash-delimited path e.g. "some-dir/some-file.yaml"
   * @param severity: Severity of this issue.
   * @param tags: Additional metadata about this issue.
   */
  constructor(
    message: string,
    readonly path: string,
    readonly severity: Severity = 'error',
    readonly tags?: { [key: string]: string }
  ) {
    super(message, severity, tags);
    this.name = 'ConfigFileError';
  }

  toIssues(): Issue[] {
    return [
      {
        message: this.message,
        severity: this.severity,
        tags: this.tags,
        file: {
          path: this.path,
        },
      },
    ];
  }

  toString(): string {
    return `${this.name}: ${this.message} in file '${this.path}' (${this.severity})`;
  }
}

/**
 * Metadata about a specific field in a Kubernetes object.
 */
export interface FieldInfo {
  // JSON path of the field.
  path: string;
  // Current value of the field.
  currentValue: string | number | boolean;
  // Suggeste value of the field to fix the issue.
  suggestedValue: string | number | boolean;
}

/**
 * Represents an issue with a Kubernetes object.
 */
export class KubernetesObjectError extends ConfigError {
  /**
   *
   * @param message: Error message.
   * @param object: Kubernertes object with the issue.
   * @param field:  Metadata about a specific field in a Kubernetes object.
   * @param severity: Severity of this issue.
   * @param tags: Additional metadata about this issue.
   */
  constructor(
    message: string,
    readonly object: KubernetesObject,
    readonly field?: FieldInfo,
    readonly severity: Severity = 'error',
    readonly tags?: { [key: string]: string }
  ) {
    super(message, severity, tags);
    this.name = 'KubernetesObjectError';
  }

  toIssues(): Issue[] {
    const path: string | undefined = getAnnotation(
      this.object,
      SOURCE_PATH_ANNOTATION
    );
    const index: number | undefined =
      Number(getAnnotation(this.object, SOURCE_INDEX_ANNOTATION)) || undefined;
    return [
      {
        message: this.message,
        severity: this.severity,
        tags: this.tags,
        resourceRef: {
          apiVersion: this.object.apiVersion,
          kind: this.object.kind,
          namespace: this.object.metadata.namespace || '',
          name: this.object.metadata.name,
        },
        file: {
          path: path,
          index: index,
        },
        field: this.field,
      },
    ];
  }

  toString(): string {
    const issue = this.toIssues()[0];
    const r = issue.resourceRef!;
    let s = `${this.name}: ${this.message} in object '${r.apiVersion}/${r.kind}/${r.namespace}/${r.name}'`;
    const path = issue.file && issue.file.path;
    if (path) {
      s += ` in file '${path}'`;
    }
    s += ` (${this.severity})`;
    return s;
  }
}

/**
 * Wraps multiple ConfigError objects.
 */
export class MultiConfigError extends ConfigError {
  /**
   * @param message: Issue message.
   * @param errors: Constituent issues.
   */
  constructor(message: string, readonly errors: ConfigError[] = []) {
    super(message);
    this.name = 'MultiConfigError';
  }

  /**
   * Add the given ConfigError to the collection.
   */
  push(error: ConfigError) {
    this.errors.push(error);
  }

  toIssues(): Issue[] {
    return this.errors
      .map(e => e.toIssues())
      .reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue),
        []
      );
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
 * Represents an error with the functionConfig used to parametrize the function.
 */
export class FunctionConfigError extends Error {
  constructor(message: string) {
    super(message);
  }
}
