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
  SOURCE_PATH_ANNOTATION,
  SOURCE_INDEX_ANNOTATION,
} from './metadata';

describe('Errors', () => {
  describe('ConfigError', () => {
    it('only message param', () => {
      const e = new ConfigError('hello');

      expect(e.toIssues()).toEqual([
        {
          message: 'hello',
          severity: 'error',
          tags: undefined,
        },
      ]);
    });

    it('all params', () => {
      const e = new ConfigError('hello', 'warning', { color: 'blue' });

      expect(e.toIssues()).toEqual([
        {
          message: 'hello',
          severity: 'warning',
          tags: { color: 'blue' },
        },
      ]);
    });
  });

  describe('ConfigFileError', () => {
    it('all params', () => {
      const e = new ConfigFileError('hello', 'a/b/c.yaml', 'note', {
        color: 'blue',
      });

      expect(e.toIssues()).toEqual([
        {
          message: 'hello',
          severity: 'note',
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
      const e = new KubernetesObjectError('hello', someObject, undefined, 'note', {
        color: 'blue',
      });

      expect(e.toIssues()).toEqual([
        {
          message: 'hello',
          severity: 'note',
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

      expect(e.toIssues()).toEqual([
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
      const e = new KubernetesObjectError(
        'hello',
        someObject,
        { path: 'x.y.z[0]', currentValue: 1, suggestedValue: 2 }
      );

      expect(e.toIssues()).toEqual([
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
    const e = new MultiConfigError('foo');
    e.push(new ConfigError('hello', 'warning'));
    e.push(new ConfigFileError('world', 'a/b/c.yaml', 'error'));
    e.push(
      new KubernetesObjectError(
        'bye',
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'foo',
            namespace: 'bar',
          },
        }
      )
    );

    it('toIssues', () => {
      expect(e.toIssues()).toEqual([
        {
          message: 'hello',
          severity: 'warning',
          tags: undefined,
        },
        {
          message: 'world',
          severity: 'error',
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
      expect(e.toString()).toEqual(`MultiConfigError: foo

[1] ConfigError: hello (warning)
[2] ConfigFileError: world in file a/b/c.yaml (error)
[3] KubernetesObjectError: bye for resource v1/Namespace/bar/foo (error)`);
    });
  });
});
