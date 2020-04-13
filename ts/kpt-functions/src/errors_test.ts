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

import {
  ConfigError,
  ConfigFileError,
  KubernetesObjectError,
  MultiConfigError,
} from './errors';
import { KubernetesObject } from './types';
import {
  addAnnotation,
  SOURCE_INDEX_ANNOTATION,
  SOURCE_PATH_ANNOTATION,
} from './metadata';

describe('Errors', () => {
  describe('ConfigError', () => {
    it('only message param', () => {
      const e = new ConfigError('hello');

      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'error',
          tags: undefined,
        },
      ]);
    });

    it('all params', () => {
      const e = new ConfigError('hello', 'warn', { color: 'blue' });

      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'warn',
          tags: { color: 'blue' },
        },
      ]);
    });
  });

  describe('ConfigFileError', () => {
    it('all params', () => {
      const e = new ConfigFileError('hello', 'a/b/c.yaml', 'info', {
        color: 'blue',
      });

      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'info',
          tags: { color: 'blue' },
          file: { path: 'a/b/c.yaml' },
        },
      ]);
    });
  });

  describe('KubernetesObjectError', () => {
    let someObject: KubernetesObject;

    beforeEach(() => {
      someObject = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: 'foo',
          namespace: 'bar',
        },
      };
    });

    it('path/index/field undefined', () => {
      const e = new KubernetesObjectError(
        'hello',
        someObject,
        undefined,
        'info',
        {
          color: 'blue',
        }
      );

      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'info',
          tags: { color: 'blue' },
          resourceRef: {
            apiVersion: 'v1',
            kind: 'Namespace',
            name: 'foo',
            namespace: 'bar',
          },
          file: { path: undefined, index: undefined },
          field: undefined,
        },
      ]);
    });

    it('path/index defined', () => {
      addAnnotation(someObject, SOURCE_PATH_ANNOTATION, 'a/b/c.yaml');
      addAnnotation(someObject, SOURCE_INDEX_ANNOTATION, '2');
      const e = new KubernetesObjectError('hello', someObject);

      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'error',
          tags: undefined,
          resourceRef: {
            apiVersion: 'v1',
            kind: 'Namespace',
            name: 'foo',
            namespace: 'bar',
          },
          file: { path: 'a/b/c.yaml', index: 2 },
          field: undefined,
        },
      ]);
    });

    it('field defined', () => {
      const e = new KubernetesObjectError('hello', someObject, {
        path: 'x.y.z[0]',
        currentValue: 1,
        suggestedValue: 2,
      });

      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'error',
          tags: undefined,
          resourceRef: {
            apiVersion: 'v1',
            kind: 'Namespace',
            name: 'foo',
            namespace: 'bar',
          },
          file: { path: undefined, index: undefined },
          field: { path: 'x.y.z[0]', currentValue: 1, suggestedValue: 2 },
        },
      ]);
    });
  });

  describe('MultiConfigerror', () => {
    const e = new MultiConfigError();
    e.push(new ConfigError('hello', 'warn'));
    e.push(new ConfigFileError('world', 'a/b/c.yaml', 'info'));
    e.push(
      new KubernetesObjectError('bye', {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
          name: 'foo',
          namespace: 'bar',
        },
      })
    );

    it('toResults', () => {
      expect(e.toResults()).toEqual([
        {
          message: 'hello',
          severity: 'warn',
          tags: undefined,
        },
        {
          message: 'world',
          severity: 'info',
          tags: undefined,
          file: { path: 'a/b/c.yaml' },
        },
        {
          message: 'bye',
          severity: 'error',
          tags: undefined,
          resourceRef: {
            apiVersion: 'v1',
            kind: 'Namespace',
            name: 'foo',
            namespace: 'bar',
          },
          file: { path: undefined, index: undefined },
          field: undefined,
        },
      ]);
    });

    it('toString', () => {
      expect(e.toString()).toEqual(`Found 3 issues:

[1] [WARN] hello
[2] [INFO] world in file 'a/b/c.yaml'
[3] [ERROR] bye in object 'v1/Namespace/bar/foo'`);
    });
  });
});
