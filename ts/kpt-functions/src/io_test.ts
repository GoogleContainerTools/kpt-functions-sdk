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
import { Configs, KubernetesObject } from './types';

describe('read', () => {
  describe('in YAML format', () => {
    it('parses empty string to empty Configs', () => {
      const result = parse('', FileFormat.YAML);

      expect(result.getAll()).toEqual([]);
    });

    it('parses single object', () => {
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

      expect(result).toEqual(`apiVersion: v1
kind: List
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
        `apiVersion: v1
kind: List
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

      expect(result).toEqual(`apiVersion: v1
kind: List
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
  });

  describe('in JSON format', () => {
    it('parses empty array to empty Configs', () => {
      const result = stringify(new Configs(), FileFormat.JSON);

      expect(result).toEqual(`{
  "apiVersion": "v1",
  "kind": "List",
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
  "apiVersion": "v1",
  "kind": "List",
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
  "apiVersion": "v1",
  "kind": "List",
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
