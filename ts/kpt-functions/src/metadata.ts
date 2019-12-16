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

export const ANNOTATION_PREFIX = 'config.kubernetes.io';
export const SOURCE_PATH_ANNOTATION = `${ANNOTATION_PREFIX}/path`;
export const SOURCE_INDEX_ANNOTATION = `${ANNOTATION_PREFIX}/index`;

/**
 * Add an annotation to a KubernetesObject's metadata. Overwrites the previously existing annotation if it exists.
 * Return the resulting object.
 *
 * @param o The object to add the annotation to.
 * @param annotation The annotation to set.
 * @param value The value to set the annotation to.
 */
export function addAnnotation(
  o: KubernetesObject,
  annotation: string,
  value: string,
): KubernetesObject {
  o.metadata.annotations = addToObject(o.metadata.annotations, annotation, value);
  return o;
}

/**
 * Remove an annotation from a KubernetesObject's metadata. If the resulting metadata.annotations is empty, removes
 * it. Return the resulting object.
 *
 * @param o The object to remove the annotation from.
 * @param annotation The annotation to remove.
 */
export function removeAnnotation(o: KubernetesObject, annotation: string): KubernetesObject {
  removeFromObject(o.metadata.annotations, annotation);
  if (o.metadata && o.metadata.annotations && Object.keys(o.metadata.annotations).length === 0) {
    delete o.metadata.annotations;
  }
  return o;
}

/**
 * Get the value of the object's annotation, or undefined if it is not set.
 *
 * @param o The object to get the annotation from.
 * @param annotation The annotation to get.
 */
export function getAnnotation(o: KubernetesObject, annotation: string): string | undefined {
  return getFromObject(o.metadata.annotations, annotation);
}

/**
 * Add a label to a KubernetesObject's metadata. Overwrites the previously existing label if it exists.
 * Return the resulting object.
 *
 * @param o The object to add the label to.
 * @param label The label to set.
 * @param value The value to set the label to.
 */
export function addLabel(o: KubernetesObject, label: string, value: string): KubernetesObject {
  o.metadata.labels = addToObject(o.metadata.labels, label, value);
  return o;
}

/**
 * Remove a label from a KubernetesObject's metadata. If the resulting metadata.labels is empty, removes
 * it. Return the resulting object.
 *
 * @param o The object to remove the label from.
 * @param label The label to remove.
 */
export function removeLabel(o: KubernetesObject, label: string): KubernetesObject {
  removeFromObject(o.metadata.labels, label);
  if (o.metadata && o.metadata.labels && Object.keys(o.metadata.labels).length === 0) {
    delete o.metadata.labels;
  }
  return o;
}

/**
 * Get the value of the object's label, or undefined if it is not set.
 *
 * @param o The object to get the label from.
 * @param label The label to get.
 */
export function getLabel(o: KubernetesObject, label: string): string | undefined {
  return getFromObject(o.metadata.labels, label);
}

function addToObject(
  object: { [key: string]: string } | undefined,
  key: string,
  value: string,
): { [key: string]: string } {
  return Object.assign(object || {}, { [key]: value });
}

function removeFromObject(object: { [key: string]: string } | undefined, key: string) {
  if (object && object[key]) {
    delete object[key];
  }
}

function getFromObject(
  object: { [key: string]: string } | undefined,
  key: string,
): string | undefined {
  return object && object[key];
}
