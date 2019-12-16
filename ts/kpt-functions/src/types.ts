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
import { getAnnotation, SOURCE_PATH_ANNOTATION } from './metadata';

/**
 * Interface implemented by all kpt functions.
 */
export type KptFunc = (configs: Configs) => void | ConfigError;

/**
 * Configs is a document store for Kubernetes objects populated from/to configuration files.
 *
 * It enables performing rich query and mutation operations.
 */
export class Configs {
  /**
   * A sorted array of the contained objects and their keys.
   */
  private objects: Array<[string, KubernetesObject]> = [];

  /**
   * Parameters used to configure a kpt function.
   */
  public readonly params: Map<string, string>;

  /**
   * Creates a Config.
   *
   * @param objects Kubernetes objects to initialize this Configs with.
   * @param params Parameters used to configure a kpt function.
   *
   * If supplied multiple objects with the same Group, Kind, Namespace, and Name, discards all but the last one.
   *
   * Does not preserve insertion order of the passed objects.
   */
  constructor(objects: KubernetesObject[] = [], params: Map<string, string> = new Map()) {
    this.params = params;
    this.insert(...objects);
  }

  /**
   * Returns the parameter value.
   *
   * @param param Name of the parameter or the {@link Param} to get the value for.
   */
  public getParam(param: string | Param): string | undefined {
    if (typeof param === 'string') {
      return this.params.get(param);
    }
    return this.params.get(param.name);
  }

  /**
   * Returns an array of objects in this Configs.
   *
   * The ordering of objects is deterministic.
   *
   * Returned objects are pass-by-reference; mutating them results in changes being persisted.
   */
  public getAll(): KubernetesObject[] {
    return this.objects.map((e) => e[1]);
  }

  /**
   * Returns an array of objects matching the passed Kind type predicate. Casts to an
   * array of Kind. May throw if isKind is incorrect.
   *
   * The ordering of objects is deterministic.
   *
   * Returned objects are pass-by-reference; mutating them results in changes being persisted.
   *
   * @param isKind is a type predicate on the desired type.
   */
  public get<Kind extends KubernetesObject>(isKind: (o: KubernetesObject) => o is Kind): Kind[] {
    return this.getAll().filter(isKind) as Kind[];
  }

  /**
   * Inserts objects into the Configs.
   *
   * If another object already in Configs has the same Group, Kind, Namespace, and Name, replaces that one with the
   * passed object.
   *
   * If multiple objects have the same Group, Kind, Namespace, and Name, discards all but the last one.
   *
   * Does not preserve insertion order of the passed objects.
   *
   * @param objects The objects to insert.
   */
  public insert(...objects: KubernetesObject[]): void {
    objects.forEach((o) => {
      const key: string = kubernetesKeyFn(o);
      const [index, found] = this.indexOf(key, this.objects, 0);
      this.objects.splice(index, found ? 1 : 0, [key, o]);
    });
  }

  /**
   * Deletes all objects with the same Group, Kind, Namespace, and Name as any of the passed objects.
   *
   * Does not throw if passed duplicates or keys which are not present in the Configs.
   *
   * @param objects The objects to delete.
   */
  public delete(...objects: KubernetesObject[]): void {
    objects.forEach((o) => {
      const key: string = kubernetesKeyFn(o);
      const [index, found] = this.indexOf(key, this.objects, 0);
      if (found) {
        this.objects.splice(index, 1);
      }
    });
  }

  /**
   * Deletes all objects.
   */
  public deleteAll(): void {
    this.objects = [];
  }

  /**
   * Partition the objects using the provided key function
   *
   * The ordering of objects with the same key is deterministic.
   *
   * Example: Partition configs by Namespace:
   *
   * const configsByNamespace = configs.groupBy((o) => o.metadata.namespace)
   *
   * @param keyFn Generates a key for each Value.
   */
  public groupBy(keyFn: (object: KubernetesObject) => string): Array<[string, KubernetesObject[]]> {
    const map = new Map<string, KubernetesObject[]>();
    this.getAll().forEach((o) => {
      const key = keyFn(o);
      const valuesAtKey = map.get(key) || [];
      map.set(key, [...valuesAtKey, o]);
    });
    return Array.from(map);
  }

  /**
   * Get the index a key should go in a sorted array, and whether the key already exists.
   *
   * @param key The key to find.
   * @param array The array to search.
   * @param offset The offset from the originally passed array.
   */
  private indexOf(
    key: string,
    array: Array<[string, KubernetesObject]>,
    offset: number,
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
      return this.indexOf(key, array.slice(mid + 1, array.length), offset + mid + 1);
    }
    // mid is the object we're looking for.
    return [offset + mid, true];
  }
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
    (o as KubernetesObject) !== undefined &&
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

/**
 * An input parameter declaration.
 */
export class Param {
  public name: string;
  public options?: ParamOptions;

  constructor(name: string, options?: ParamOptions) {
    this.name = name;
    this.options = options;
  }
}

/**
 * Defines paramter options.
 */
export class ParamOptions {
  // The default value to provide the Paramter.
  public readonly defaultValue?: string;
  // If true and the Paramter is not provided at runtime, display an error and do not run the kpt function.
  public readonly required?: boolean;
  // A description of the Paramter and what it is used for.
  public readonly help?: string;
}

/**
 * Represents a non-exceptional issue with configuration.
 *
 * For operational errors such as IO operation failures, throw errors instead of returning a ConfigError.
 */
export class ConfigError {
  public readonly error: string;

  constructor(error: string, detail?: any) {
    if (detail) {
      this.error = `${error}: ${detail}`;
    } else {
      this.error = error;
    }
  }

  public toString(): string {
    return this.error;
  }

  public log(): void {
    console.error(this.toString());
  }
}

/**
 * Type guard for ConfigError.
 */
export function isConfigError(o: any): o is ConfigError {
  return o instanceof ConfigError;
}

export function newManifestError(msg: string, ...objects: KubernetesObject[]): ConfigError {
  return new ConfigError(msg, objects.map(printManifest).join('\n'));
}

function printManifest(o: KubernetesObject): string {
  const file = getAnnotation(o, SOURCE_PATH_ANNOTATION) || '[no source file]';
  const namespace = o.metadata.namespace || '';
  return `

file: "${file}"
apiVersion: "${o.apiVersion}"
kind: "${o.kind}"
metadata.namespace: "${namespace}"
metadata.name: "${o.metadata.name}"
`;
}
