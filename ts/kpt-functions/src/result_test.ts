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
import {
  addAnnotation,
  SOURCE_INDEX_ANNOTATION,
  SOURCE_PATH_ANNOTATION,
  LEGACY_SOURCE_INDEX_ANNOTATION,
  LEGACY_SOURCE_PATH_ANNOTATION,
} from './metadata';
import {
  generalResult,
  configFileResult,
  kubernetesObjectResult,
} from './result';

describe('Results', () => {
  describe('inGeneral', () => {
    it('only message param', () => {
      const e = generalResult('hello');

      expect(e).toEqual({
        message: 'hello',
        severity: 'error',
        tags: undefined,
      });
    });

    it('all params', () => {
      const e = generalResult('hello', 'warn', { color: 'blue' });

      expect(e).toEqual({
        message: 'hello',
        severity: 'warn',
        tags: { color: 'blue' },
      });
    });
  });

  describe('configFileResult', () => {
    it('all params', () => {
      const e = configFileResult('hello', 'a/b/c.yaml', 'info', {
        color: 'blue',
      });

      expect(e).toEqual({
        message: 'hello',
        severity: 'info',
        tags: { color: 'blue' },
        file: { path: 'a/b/c.yaml' },
      });
    });
  });

  describe('kubernetesObjectResult', () => {
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
      const e = kubernetesObjectResult('hello', someObject, undefined, 'info', {
        color: 'blue',
      });

      expect(e).toEqual({
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
      });
    });

    it('path/index defined', () => {
      addAnnotation(someObject, SOURCE_PATH_ANNOTATION, 'a/b/c.yaml');
      addAnnotation(someObject, SOURCE_INDEX_ANNOTATION, '2');
      const e = kubernetesObjectResult('hello', someObject);

      expect(e).toEqual({
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
      });
    });

    it('legacy path/index defined', () => {
      addAnnotation(someObject, LEGACY_SOURCE_PATH_ANNOTATION, 'a/b/c.yaml');
      addAnnotation(someObject, LEGACY_SOURCE_INDEX_ANNOTATION, '2');
      const e = kubernetesObjectResult('hello', someObject);

      expect(e).toEqual({
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
      });
    });

    it('field defined', () => {
      const e = kubernetesObjectResult('hello', someObject, {
        path: 'x.y.z[0]',
        currentValue: 1,
        proposedValue: 2,
      });

      expect(e).toEqual({
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
        field: { path: 'x.y.z[0]', currentValue: 1, proposedValue: 2 },
      });
    });

    it('supports object-typed value suggestions', () => {
      const e = kubernetesObjectResult('hello', someObject, {
        path: 'x.y.z[0]',
        currentValue: {
          w: 0,
          v: false,
        },
        proposedValue: {
          w: 1,
          v: 'hi',
        },
      });

      expect(e).toEqual({
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
        field: {
          path: 'x.y.z[0]',
          currentValue: {
            w: 0,
            v: false,
          },
          proposedValue: {
            w: 1,
            v: 'hi',
          },
        },
      });
    });

    it('supports array-typed value suggestions', () => {
      const e = kubernetesObjectResult('hello', someObject, {
        path: 'x.y.z[0]',
        currentValue: [1, 'true', false],
        proposedValue: [1, true, 'false'],
      });

      expect(e).toEqual({
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
        field: {
          path: 'x.y.z[0]',
          currentValue: [1, 'true', false],
          proposedValue: [1, true, 'false'],
        },
      });
    });
  });
});
