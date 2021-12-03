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

import { FileFormat, parse, stringify } from './io';
import { Configs, JsonArray, KubernetesObject } from './types';
import { kubernetesObjectResult } from './result';

describe('read', () => {
  describe('in YAML format', () => {
    it('parses empty string to empty Configs', () => {
      const result = parse('', FileFormat.YAML);

      expect(result.getAll()).toEqual([]);
    });

    it('parses List object', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
`,
        FileFormat.YAML
      );
      expect(result.getAll()).toEqual([
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'foo',
          },
        },
      ]);
    });

    it('parses ResourceList object', () => {
      const result = parse(
        `
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
`,
        FileFormat.YAML
      );
      expect(result.getAll()).toEqual([
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'foo',
          },
        },
      ]);
    });

    it('parses undefined functionConfig', () => {
      const result = parse('', FileFormat.YAML);

      expect(result.getFunctionConfig()).toBeUndefined();
    });

    it('parses functionConfig from input', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
functionConfig:
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: bar
  data:
    a: b
`,
        FileFormat.YAML
      );

      expect(result.getFunctionConfig()).toEqual({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'bar',
        },
        data: {
          a: 'b',
        },
      } as KubernetesObject);
    });

    it('parses functionConfig from string', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
`,
        FileFormat.YAML,
        `
apiVersion: v1
kind: ConfigMap
metadata:
  name: baz
data:
  x: y
`
      );

      expect(result.getFunctionConfig()).toEqual({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'baz',
        },
        data: {
          x: 'y',
        },
      } as KubernetesObject);
    });

    it('parses functionConfig overrides input', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
functionConfig:
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: bar
  data:
    a: b
`,
        FileFormat.YAML,
        `
apiVersion: v1
kind: ConfigMap
metadata:
  name: baz
data:
  x: y
`
      );

      expect(result.getFunctionConfig()).toEqual({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'baz',
        },
        data: {
          x: 'y',
        },
      } as KubernetesObject);
    });

    it('parses functionConfig from object', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
functionConfig:
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: bar
  data:
    a: b
`,
        FileFormat.YAML,
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            name: 'baz',
          },
          data: {
            x: 'y',
          },
        } as KubernetesObject
      );

      expect(result.getFunctionConfig()).toEqual({
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'baz',
        },
        data: {
          x: 'y',
        },
      } as KubernetesObject);
    });

    it('parses multiple objects', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: backend
- apiVersion: rbac.authorization.k8s.io/v1
  kind: Role
  metadata:
    name: my-role
`,
        FileFormat.YAML
      );

      expect(result.getAll()).toEqual([
        {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          kind: 'Role',
          metadata: {
            name: 'my-role',
          },
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'backend',
          },
        },
      ]);
    });
  });

  describe('in JSON format', () => {
    it('parses empty array to empty Configs', () => {
      const result = parse('[]', FileFormat.JSON);

      expect(result.getAll()).toEqual([]);
    });

    it('parses single object', () => {
      const result = parse(
        `{
"apiVersion": "v1",
"kind": "List",
"items": [{
  "apiVersion": "v1",
  "kind": "Namespace",
  "metadata": {"name": "foo"}
}]}`,
        FileFormat.JSON
      );

      expect(result.getAll()).toEqual([
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'foo',
          },
        },
      ]);
    });

    it('parses multiple objects', () => {
      const result = parse(
        `{
"apiVersion": "v1",
"kind": "List",
"items": [{
  "apiVersion": "v1",
  "kind": "Namespace",
  "metadata": {"name": "backend"}
}, {
  "apiVersion": "rbac.authorization.k8s.io/v1",
  "kind": "Role",
  "metadata": {"name": "my-role"}
}]}`,
        FileFormat.JSON
      );

      expect(result.getAll()).toEqual([
        {
          apiVersion: 'rbac.authorization.k8s.io/v1',
          kind: 'Role',
          metadata: {
            name: 'my-role',
          },
        },
        {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: 'backend',
          },
        },
      ]);
    });
  });

  describe('special cases', () => {
    // These don't need to be tested in both langauges since the logic is duplicated.
    it('parses empty List to empty Configs', () => {
      const result = parse(
        `
apiVersion: v1
kind: List
`,
        FileFormat.YAML
      );

      expect(result.getAll()).toEqual([]);
    });

    it('throws on encountering embedded Lists', () => {
      const raw = `
apiVersion: v1
kind: List
items:
- apiVersion: v1
- kind: List
- items: []
`;
      expect(() => parse(raw, FileFormat.YAML)).toThrow();
    });

    it('throws on encountering simple types', () => {
      const raw = `
apiVersion: v1
kind: List
items:
- {}
`;
      expect(() => parse(raw, FileFormat.YAML)).toThrow();
    });
  });
});

describe('write', () => {
  describe('in YAML format', () => {
    it('writes empty Configs as empty List', () => {
      const result = stringify(new Configs(), FileFormat.YAML);

      expect(result).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items: []
`);
    });

    it('writes single object', () => {
      const result = stringify(
        new Configs([
          {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: 'foo',
            },
          },
        ]),
        FileFormat.YAML
      );

      expect(result).toEqual(
        `apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: foo
`
      );
    });

    it('writes multiple objects', () => {
      const result = stringify(
        new Configs([
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'Role',
            metadata: {
              name: 'my-role',
            },
          },
          {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: 'backend',
            },
          },
        ]),
        FileFormat.YAML
      );

      expect(result).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items:
- apiVersion: rbac.authorization.k8s.io/v1
  kind: Role
  metadata:
    name: my-role
- apiVersion: v1
  kind: Namespace
  metadata:
    name: backend
`);
    });

    it('has results', () => {
      const configs = new Configs();
      configs.addResults({ message: 'hello', severity: 'error' });

      const result = stringify(configs, FileFormat.YAML);

      expect(result).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items: []
results:
- message: hello
  severity: error
`);
    });

    it('preserves long lines', () => {
      const result = stringify(
        new Configs([
          {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789',
            },
          },
        ]),
        FileFormat.YAML
      );

      expect(result).toEqual(
        `apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: 0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
`
      );
    });

    it('has results with object typed suggested values', () => {
      const configs = new Configs();
      configs.addResults({
        message: 'hello',
        severity: 'error',
        field: {
          path: 'foo',
          currentValue: { a: 3 },
          proposedValue: { a: 4 },
        },
      });

      const result = stringify(configs, FileFormat.YAML);

      expect(result).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items: []
results:
- message: hello
  severity: error
  field:
    path: foo
    currentValue:
      a: 3
    proposedValue:
      a: 4
`);
    });

    it('has results with array typed suggested values', () => {
      const configs = new Configs();
      configs.addResults({
        message: 'hello',
        severity: 'error',
        field: {
          path: 'foo',
          currentValue: [3],
          proposedValue: [4],
        },
      });

      const result = stringify(configs, FileFormat.YAML);

      expect(result).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items: []
results:
- message: hello
  severity: error
  field:
    path: foo
    currentValue:
    - 3
    proposedValue:
    - 4
`);
    });

    it('has results with null as a suggested value', () => {
      const configs = new Configs();
      configs.addResults({
        message: 'hello',
        severity: 'error',
        field: {
          path: 'foo',
          // tslint:disable-next-line:no-null-keyword
          currentValue: null,
          // tslint:disable-next-line:no-null-keyword
          proposedValue: null,
        },
      });

      const result = stringify(configs, FileFormat.YAML);

      expect(result).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items: []
results:
- message: hello
  severity: error
  field:
    path: foo
    currentValue: null
    proposedValue: null
`);
    });
  });

  describe('in JSON format', () => {
    it('parses empty array to empty Configs', () => {
      const result = stringify(new Configs(), FileFormat.JSON);

      expect(result).toEqual(`{
  "apiVersion": "config.kubernetes.io/v1",
  "kind": "ResourceList",
  "metadata": {
    "name": "output"
  },
  "items": []
}
`);
    });

    it('writes single object', () => {
      const result = stringify(
        new Configs([
          {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: 'foo',
            },
          },
        ]),
        FileFormat.JSON
      );

      expect(result).toEqual(`{
  "apiVersion": "config.kubernetes.io/v1",
  "kind": "ResourceList",
  "metadata": {
    "name": "output"
  },
  "items": [
    {
      "apiVersion": "v1",
      "kind": "Namespace",
      "metadata": {
        "name": "foo"
      }
    }
  ]
}
`);
    });

    it('writes multiple objects', () => {
      const result = stringify(
        new Configs([
          {
            apiVersion: 'rbac.authorization.k8s.io/v1',
            kind: 'Role',
            metadata: {
              name: 'my-role',
            },
          },
          {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: 'backend',
            },
          },
        ]),
        FileFormat.JSON
      );

      expect(result).toEqual(`{
  "apiVersion": "config.kubernetes.io/v1",
  "kind": "ResourceList",
  "metadata": {
    "name": "output"
  },
  "items": [
    {
      "apiVersion": "rbac.authorization.k8s.io/v1",
      "kind": "Role",
      "metadata": {
        "name": "my-role"
      }
    },
    {
      "apiVersion": "v1",
      "kind": "Namespace",
      "metadata": {
        "name": "backend"
      }
    }
  ]
}
`);
    });
  });
});

describe('roundtrip', () => {
  describe('using YAML', () => {
    it('should not insert YAML references', () => {
      interface Baz {
        baz: number;
      }

      interface Foo extends KubernetesObject {
        spec: {
          array: Baz[];
        };
      }

      const input =
        'items: [{apiVersion: v1, kind: Foo, metadata: {name: bar}, spec: {array: [{baz: 1}]}}]';
      const configs = parse(input, FileFormat.YAML);

      const foo = configs.getAll()[0] as Foo;
      configs.addResults(
        kubernetesObjectResult('something is wrong', foo, {
          path: 'spec.array',
          // Note: we re-use objects from the input to trigger YAML refs to normally be created
          currentValue: foo.spec.array as unknown as JsonArray,
          proposedValue: foo.spec.array.concat([
            { baz: 3 },
          ]) as unknown as JsonArray,
        })
      );

      const stringified = stringify(configs, FileFormat.YAML);

      // We want to verify that there are no back-references like &ref and *ref in the output
      expect(stringified).toEqual(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
metadata:
  name: output
items:
- apiVersion: v1
  kind: Foo
  metadata:
    name: bar
  spec:
    array:
    - baz: 1
results:
- message: something is wrong
  severity: error
  resourceRef:
    apiVersion: v1
    kind: Foo
    namespace: ''
    name: bar
  file: {}
  field:
    path: spec.array
    currentValue:
    - baz: 1
    proposedValue:
    - baz: 1
    - baz: 3
`);
    });
  });
});
