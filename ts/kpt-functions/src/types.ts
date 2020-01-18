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

import { ObjectMeta } from './gen/io.k8s.apimachinery.pkg.apis.meta.v1';
import { ConfigError } from './errors';

/**
 * Interface describing KPT functions.
 */
export interface KptFunc {
  /**
   * A function consumes and optionally mutates Kubernetes configurations using the given [[Configs]] object.
   *
   * The function should:
   * - Return a [[ConfigError]] when encountering one or more configuration-related issues.
   * - Throw an error when encountering operational issues such as IO exceptions.
   * - Avoid writing to stdout (e.g. using process.stdout) as it is used for chaining functions.
   *   Use stderr instead.
   */
  (configs: Configs): void | ConfigError;

  /**
   * Usage message describing what the function does, how to use it, and how to configure it.
   */
  usage: string;
}

/**
 * Configs is an in-memory document store for Kubernetes objects populated from/to configuration files.
 *
 * It enables performing rich query and mutation operations.
 */
export class Configs {
  /**
   * Creates a Config.
   *
   * @param items Input Kubernetes objects.
   * If supplied multiple objects with the same (Group, Kind, Namespace, Name) discards all but the last one.
   * Does not preserve insertion order of the passed objects.
   * @param functionConfig Kubernetes object used to parameterize the function's behavior.
   */
  constructor(
    items: KubernetesObject[] = [],
    functionConfig?: KubernetesObject
  ) {
    this.functionConfig = functionConfig;
    this.insert(...items);
  }

  /**
   * Returns an array of all the objects in this Configs.
   *
   * The ordering of objects is deterministic.
   *
   * Returned objects are pass-by-reference; mutating them results in changes being persisted.
   */
  getAll(): KubernetesObject[] {
    return this.items.map(e => e[1]);
  }

  /**
   * Returns an array of objects matching the passed Kind type predicate.
   *
   * Casts to an array of Kind. May throw if isKind is incorrect.
   *
   * The ordering of objects is deterministic.
   *
   * Returned objects are pass-by-reference; mutating them results in changes being persisted.
   *
   * @param isKind is a type predicate on the desired type.
   */
  get<Kind extends KubernetesObject>(
    isKind: (o: KubernetesObject) => o is Kind
  ): Kind[] {
    return this.getAll().filter(isKind) as Kind[];
  }

  /**
   * Inserts objects into the Configs.
   *
   * If another object already in Configs has the same (Group, Kind, Namespace, Name), replaces that one with the
   * passed object.
   *
   * If multiple objects have the same (Group, Kind, Namespace, Name), discards all but the last one.
   *
   * Does not preserve insertion order of the passed objects.
   *
   * @param objects The objects to insert.
   */
  insert(...objects: KubernetesObject[]): void {
    objects.forEach(o => {
      const key: string = kubernetesKeyFn(o);
      const [index, found] = this.indexOf(key, this.items, 0);
      this.items.splice(index, found ? 1 : 0, [key, o]);
    });
  }

  /**
   * Deletes all objects with the same (Group, Kind, Namespace, Name) as any of the passed objects.
   *
   * Does not throw if passed duplicates or keys which are not present in the Configs.
   *
   * @param objects The objects to delete.
   */
  delete(...objects: KubernetesObject[]): void {
    objects.forEach(o => {
      const key: string = kubernetesKeyFn(o);
      const [index, found] = this.indexOf(key, this.items, 0);
      if (found) {
        this.items.splice(index, 1);
      }
    });
  }

  /**
   * Deletes all objects.
   */
  deleteAll(): void {
    this.items = [];
  }

  /**
   * Partitions the objects using the provided key function
   *
   * The ordering of objects with the same key is deterministic.
   *
   * Example: Partition configs by Namespace:
   *
   * const configsByNamespace = configs.groupBy((o) => o.metadata.namespace)
   *
   * @param keyFn Generates a key for each Value.
   */
  groupBy(
    keyFn: (object: KubernetesObject) => string
  ): Array<[string, KubernetesObject[]]> {
    const map = new Map<string, KubernetesObject[]>();
    this.getAll().forEach(o => {
      const key = keyFn(o);
      const valuesAtKey = map.get(key) || [];
      map.set(key, [...valuesAtKey, o]);
    });
    return Array.from(map);
  }

  /**
   * Returns the functionConfig if defined.
   */
  getFunctionConfig(): KubernetesObject | undefined {
    return this.functionConfig;
  }

  /**
   * Returns the value for the given key if functionConfig is of kind ConfigMap.
   *
   * Throws an exception if functionConfig kind is not a ConfigMap.
   *
   * Returns undefined if functionConfig is undefined OR
   * if the ConfigMap has no such key in the 'data' section.
   *
   * @key key The key in the 'data' field in the ConfigMap object passed as the functionConfig.
   */
  getFunctionConfigValue(key: string): string | undefined {
    const cm = this.functionConfig;
    if (!cm) {
      return undefined;
    }
    if (!isConfigMap(cm)) {
      throw new Error(
        `functionConfig expected to be of kind ConfigMap, instead got: ${cm.kind}`
      );
    }
    return cm.data && cm.data[key];
  }

  /**
   * Similar to {@link getFunctionConfigValue} except it throws an exception if the given key is undefined.
   */
  getFunctionConfigValueOrThrow(key: string): string {
    const val = this.getFunctionConfigValue(key);
    if (val === undefined) {
      throw new Error(
        `Missing key ${key} in ConfigMap data provided as functionConfig`
      );
    }
    return val;
  }

  /**
   * Gets the index a key should go in a sorted array, and whether the key already exists.
   *
   * @param key The key to find.
   * @param array The array to search.
   * @param offset The offset from the originally passed array.
   */
  private indexOf(
    key: string,
    array: Array<[string, KubernetesObject]>,
    offset: number
  ): [number, boolean] {
    if (array.length === 0) {
      // array is empty so the value cannot be in it.
      return [offset, false];
    }

    const mid = Math.floor(array.length / 2);
    if (key < array[mid][0]) {
      // Look before mid.
      return this.indexOf(key, array.slice(0, mid), offset);
    } else if (key > array[mid][0]) {
      // Look after mid.
      return this.indexOf(
        key,
        array.slice(mid + 1, array.length),
        offset + mid + 1
      );
    }
    // mid is the object we're looking for.
    return [offset + mid, true];
  }

  /**
   * A sorted array of the contained objects and their keys.
   */
  private items: Array<[string, KubernetesObject]> = [];

  /**
   * Object used as parameters to the function.
   */
  private readonly functionConfig: KubernetesObject | undefined;
}

/**
 * Interface implemented by Kubernetes objects.
 */
export interface KubernetesObject {
  apiVersion: string;
  kind: string;
  metadata: ObjectMeta;
}

/**
 * Type guard for KubernetesObject.
 */
export function isKubernetesObject(o: any): o is KubernetesObject {
  return (
    o &&
    o.apiVersion !== '' &&
    o.kind !== '' &&
    o.metadata &&
    o.metadata.name !== ''
  );
}

/**
 * Generates the primary key for a Kubernetes objects in Configs.
 */
export function kubernetesKeyFn(o: KubernetesObject): string {
  const namespace = o.metadata.namespace || '';
  return `${o.apiVersion}/${o.kind}/${namespace}/${o.metadata.name}`;
}

interface ConfigMap extends KubernetesObject {
  data?: { [key: string]: string };
}

function isConfigMap(o: any): o is ConfigMap {
  return o && o.apiVersion === 'v1' && o.kind === 'ConfigMap';
}
