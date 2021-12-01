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
import { FunctionConfigError } from './errors';

/**
 * Interface describing kpt functions.
 */
export interface KptFunc {
  /**
   * A function consumes and optionally mutates Kubernetes configurations using the given [[Configs]] object.
   *
   * The function should:
   * - Throw errors when encountering operational issues such as IO exceptions.
   * - Avoid writing to stdout (e.g. using process.stdout) as it is used for chaining functions.
   *   Use stderr instead.
   */
  (configs: Configs): Promise<void>;

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
   * @param input Input Kubernetes objects.
   * If supplied multiple objects with the same [[kubernetesKey]] discards all but the last one.
   * Does not preserve insertion order of the given objects.
   * @param functionConfig Kubernetes object used to parameterize the function's behavior.
   * @param results For testing only: List of Results returned by the function.
   */
  constructor(
    input: KubernetesObject[] = [],
    functionConfig?: KubernetesObject,
    results?: Result[]
  ) {
    this.insert(...input);
    this.functionConfig = functionConfig;
    this.results = results || [];
  }

  /**
   * Returns an array of all the objects in this Configs.
   *
   * The ordering of objects is deterministic.
   *
   * Returned objects are pass-by-reference; mutating them results in changes being persisted.
   */
  getAll(): KubernetesObject[] {
    return this.objects.map((e) => e[1]);
  }

  /**
   * Returns an array of objects matching the given Kind type predicate.
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
   * If another object already in Configs has the same [[kubernetesKey]], replaces that one with the
   * given object.
   *
   * If inserting multiple objects with the same [[kubernetesKey]], discards all but the last one.
   *
   * Does not preserve insertion order of the given objects.
   *
   * @param objects The objects to insert.
   */
  insert(...objects: KubernetesObject[]): void {
    objects.forEach((o) => {
      const key: string = kubernetesKey(o);
      const [index, found] = this.indexOf(key, this.objects, 0);
      this.objects.splice(index, found ? 1 : 0, [key, o]);
    });
  }

  /**
   * Deletes all objects with the same [[kubernetesKey]] as any of the given objects.
   *
   * Does not throw if given duplicates or keys which are not present in the Configs.
   *
   * @param objects The objects to delete.
   */
  delete(...objects: KubernetesObject[]): void {
    objects.forEach((o) => {
      const key: string = kubernetesKey(o);
      const [index, found] = this.indexOf(key, this.objects, 0);
      if (found) {
        this.objects.splice(index, 1);
      }
    });
  }

  /**
   * Deletes all objects.
   */
  deleteAll(): void {
    this.objects = [];
  }

  /**
   * Partitions the objects using the provided key function
   *
   * The ordering of objects with the same key is deterministic.
   *
   * Example: Partition configs by Namespace:
   *
   * ```
   * const configsByNamespace = configs.groupBy((o) => o.metadata.namespace)
   * ```
   *
   * @param keyFn Generates a key for each Value.
   */
  groupBy(
    keyFn: (object: KubernetesObject) => string
  ): Array<[string, KubernetesObject[]]> {
    const map = new Map<string, KubernetesObject[]>();
    this.getAll().forEach((o) => {
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
   * Returns the map of data values if functionConfig is of kind ConfigMap.
   *
   * Throws a FunctionConfigError if functionConfig is undefined OR
   * if the kind is not a v1/ConfigMap.
   */
  getFunctionConfigMap(): Map<string, string> | undefined {
    const cm = this.getFunctionConfig();
    if (cm === undefined) {
      return undefined;
    }
    if (!isConfigMap(cm)) {
      throw new FunctionConfigError(
        `functionConfig expected to be of kind ConfigMap, instead got: ${cm.kind}`
      );
    }

    const configMap = new Map<string, string>();
    for (const key in cm.data) {
      if (cm.data.hasOwnProperty(key)) {
        configMap.set(key, cm.data[key]);
      }
    }

    return configMap;
  }

  /**
   * Returns the value for the given key if functionConfig is of kind ConfigMap.
   *
   * Throws a FunctionConfigError if functionConfig kind is not a ConfigMap.
   *
   * Returns undefined if functionConfig is undefined OR
   * if the ConfigMap has no such key in the 'data' section.
   *
   * @key key The key in the 'data' field in the ConfigMap object given as the functionConfig.
   */
  getFunctionConfigValue(key: string): string | undefined {
    const cm = this.getFunctionConfigMap();
    return cm ? cm.get(key) : undefined;
  }

  /**
   * Detects if an unknown value has been provided to the config map
   * @param expectedDataKeys The set of keys expected in the Configs data
   * @returns Returns undefined if the config map is undefined. Otherwise
   * returns a string[] containing the invalid keys. The string[] will be empty
   * if all of the config maps keys are members of the expecteKeys.
   */
  hasUnexpectedFunctionParameter(
    expectedDataKeys: string[]
  ): string[] | undefined {
    const unexpected: string[] = [];
    const configMap = this.getFunctionConfigMap();
    if (configMap === undefined) {
      return undefined;
    }
    for (let key of configMap.keys()) {
      if (!expectedDataKeys.includes(key)) {
        unexpected.push(key);
      }
    }
    return unexpected;
  }

  /**
   * Similar to [[getFunctionConfigValue]] except it throws a ConfigError if the given key is undefined.
   */
  getFunctionConfigValueOrThrow(key: string): string {
    const configMap = this.getFunctionConfigMap();
    if (configMap === undefined) {
      throw new FunctionConfigError(`The function config map was undefined`);
    }

    const val = this.getFunctionConfigValue(key);
    if (val === undefined) {
      throw new FunctionConfigError(
        `Missing 'data.${key}' in ConfigMap provided as functionConfig`
      );
    }
    return val;
  }

  /**
   * Adds given result(s) representing structured findings by the function.
   */
  addResults(...results: Result[]) {
    if (this.logToStdErr) {
      results.forEach((r) => console.error(resultToString(r)));
    }
    this.results.push(...results);
  }

  /**
   * Get result(s) representing structured findings by the function.
   */
  getResults(): Result[] {
    return this.results;
  }

  /**
   * Returns the ResourceList representation of this Configs object.
   */
  toResourceList(): ResourceList {
    return new ResourceList(
      this.getAll(),
      this.results.length ? this.results : undefined
    );
  }

  /**
   * Returns a deep copy of Configs.
   */
  deepCopy(): Configs {
    const objects = JSON.parse(JSON.stringify(this.getAll()));
    const functionConfig =
      this.functionConfig && JSON.parse(JSON.stringify(this.functionConfig));
    const results = JSON.parse(JSON.stringify(this.results));
    return new Configs(objects, functionConfig, results);
  }

  /**
   * Gets the index a key should go in a sorted array, and whether the key already exists.
   *
   * @param key The key to find.
   * @param array The array to search.
   * @param offset The offset from the originally given array.
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
  private objects: Array<[string, KubernetesObject]> = [];

  /**
   * Object used as parameters to the function.
   */
  private readonly functionConfig: KubernetesObject | undefined;

  /**
   * List of Results returned by the function.
   */
  private readonly results: Result[];

  /**
   * Determines whether [[addResults]] should also log to stderr.
   */
  logToStdErr: boolean | undefined;
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
 * A unique key for a Kubernetes object defined as tuple of (apiVersion, kind, namespace, name).
 */
export function kubernetesKey(o: KubernetesObject): string {
  const namespace = o.metadata.namespace || '';
  return `${o.apiVersion}/${o.kind}/${namespace}/${o.metadata.name}`;
}

/**
 * ResourceList is the wire format for the output of the kpt function as defined by the spec:
 * https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
 */
export class ResourceList implements KubernetesObject {
  readonly apiVersion = 'config.kubernetes.io/v1';
  readonly kind = 'ResourceList';
  readonly metadata = {
    name: 'output',
  };
  readonly items: KubernetesObject[];
  readonly results?: Result[];

  /**
   * @param items List of Kubernetes objects returned by the function.
   * @param results List of results returned by the function.
   */
  constructor(items: KubernetesObject[], results?: Result[]) {
    this.items = items;
    this.results = results;
  }
}

/**
 * Result represents a configuration-related issue returned by a function.
 *
 * It can be at the following granularities:
 * - A file containing multiple objects
 * - A specific kubernetes object
 * - A specific field of a kubernetes object
 */
export interface Result {
  // Severify of the issue.
  severity: Severity;
  // Message describing the issue.
  message: string;
  // Additional metadata for tracking the issue.
  tags?: { [key: string]: string };
  // A reference to the object with the issue.
  resourceRef?: {
    apiVersion: string;
    kind: string;
    namespace: string;
    name: string;
  };
  // File-level for the issue.
  file?: {
    // OS agnostic, relative, slash-delimited path.
    // e.g. "some-dir/some-file.yaml"
    path?: string;
    // Index of the object in a multi-object YAML file.
    index?: number;
  };
  // A specific field in the object.
  field?: FieldInfo;
}

/**
 * Severity of a configuration result.
 */
export type Severity = 'error' | 'warn' | 'info';

/** A plain old JSON array according to ECMA-404. */
export interface JsonArray extends Array<Json> {}

/** A plain old JSON object/map according to ECMA-404. */
export interface JsonMap {
  [field: string]: Json;
}

/** Any plain old JSON value according to ECMA-404. */
export type Json = null | boolean | number | string | JsonArray | JsonMap;

/**
 * Metadata about a specific field in a Kubernetes object.
 */
export interface FieldInfo {
  // JSON Path
  // e.g. "spec.template.spec.containers[3].resources.limits.cpu"
  path: string;
  // Current value of the field.
  currentValue?: Json;
  // Proposed value to fix the issue.
  proposedValue?: Json;
}

function resultToString(result: Result): string {
  let s = `[${result.severity.toUpperCase()}] ${result.message}`;
  if (result.resourceRef) {
    const r = result.resourceRef;
    s += ` in object '${r.apiVersion}/${r.kind}/${r.namespace}/${r.name}'`;
  }
  if (result.file?.path) {
    s += ` in file ${result.file.path}`;
  }
  if (result.field?.path) {
    s += ` in field ${result.field.path}`;
  }
  return s;
}

interface ConfigMap extends KubernetesObject {
  data?: { [key: string]: string };
}

function isConfigMap(o: any): o is ConfigMap {
  return o && o.apiVersion === 'v1' && o.kind === 'ConfigMap';
}
