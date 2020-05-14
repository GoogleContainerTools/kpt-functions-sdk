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

import { KubernetesObject, Result, Severity, FieldInfo } from './types';
import {
  SOURCE_INDEX_ANNOTATION,
  SOURCE_PATH_ANNOTATION,
  getAnnotation,
} from './metadata';

/**
 * A general result.
 *
 * Typically, the function should the more specific [[configFileResult]] or [[kubernetesObjectResult]] functions.
 */
export function generalResult(
  message: string,
  severity: Severity = 'error',
  tags?: { [key: string]: string }
): Result {
  return {
    message: message,
    severity: severity,
    tags: tags,
  };
}

/**
 * A result relating to a configuration file.
 */
export function configFileResult(
  message: string,
  path: string,
  severity: Severity = 'error',
  tags?: { [key: string]: string }
): Result {
  return {
    message: message,
    severity: severity,
    tags: tags,
    file: {
      path: path,
    },
  };
}

/**
 * A result relating to a Kubernetes object.
 */
export function kubernetesObjectResult(
  message: string,
  object: KubernetesObject,
  field?: FieldInfo,
  severity: Severity = 'error',
  tags?: { [key: string]: string }
): Result {
  const path: string | undefined = getAnnotation(
    object,
    SOURCE_PATH_ANNOTATION
  );
  const index: number | undefined =
    Number(getAnnotation(object, SOURCE_INDEX_ANNOTATION)) || undefined;
  return {
    message: message,
    severity: severity,
    tags: tags,
    resourceRef: {
      apiVersion: object.apiVersion,
      kind: object.kind,
      namespace: object.metadata.namespace || '',
      name: object.metadata.name,
    },
    file: {
      path: path,
      index: index,
    },
    field: field,
  };
}
