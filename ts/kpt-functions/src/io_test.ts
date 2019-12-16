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

import { FileFormat, read, write } from './io';
import { Configs } from './types';

namespace Namespace {
  export const apiVersion: string = 'v1';
  export const kind: string = 'Namespace';
}

namespace Role {
  export const apiVersion: string = 'rbac.authorization.k8s.io/v1';
  export const kind: string = 'Role';
}

describe('read', () => {
  describe('in YAML format', () => {
    it('parses empty string to empty Configs', () => {
      const result = read('', FileFormat.YAML);

      expect(result.getAll()).toEqual([]);
    });

    it('parses single object', () => {
      const result = read(
        `
apiVersion: v1
kind: List
items:
- apiVersion: ${Namespace.apiVersion}
  kind: ${Namespace.kind}
  metadata:
    name: foo
`,
        FileFormat.YAML,
      );
      expect(result.getAll()).toEqual([
        {
          apiVersion: Namespace.apiVersion,
          kind: Namespace.kind,
          metadata: {
            name: 'foo',
          },
        },
      ]);
    });

    it('parses single object with functionConfig', () => {
      const result = read(
        `
apiVersion: v1
kind: List
items:
- apiVersion: ${Namespace.apiVersion}
  kind: ${Namespace.kind}
  metadata:
    name: foo
functionConfig:
  data:
    a: b
`,
        FileFormat.YAML,
      );

      expect(result.getAll()).toEqual([
        {
          apiVersion: Namespace.apiVersion,
          kind: Namespace.kind,
          metadata: {
            name: 'foo',
          },
        },
      ]);
      expect(result.params).toEqual(new Map([['a', 'b']]));
    });

    it('parses multiple objects', () => {
      const result = read(
        `
apiVersion: v1
kind: List
items:
- apiVersion: ${Namespace.apiVersion}
  kind: ${Namespace.kind}
  metadata:
    name: backend
- apiVersion: ${Role.apiVersion}
  kind: ${Role.kind}
  metadata:
    name: my-role
`,
        FileFormat.YAML,
      );

      expect(result.getAll()).toEqual([
        {
          apiVersion: Role.apiVersion,
          kind: Role.kind,
          metadata: {
            name: 'my-role',
          },
        },
        {
          apiVersion: Namespace.apiVersion,
          kind: Namespace.kind,
          metadata: {
            name: 'backend',
          },
        },
      ]);
    });
  });

  describe('in JSON format', () => {
    it('parses empty array to empty Configs', () => {
      const result = read('[]', FileFormat.JSON);

      expect(result.getAll()).toEqual([]);
    });

    it('parses single object', () => {
      const result = read(
        `{
"apiVersion": "v1",
"kind": "List",
"items": [{
  "apiVersion": "${Namespace.apiVersion}",
  "kind": "${Namespace.kind}",
  "metadata": {"name": "foo"}
}]}`,
        FileFormat.JSON,
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
      const result = read(
        `{
"apiVersion": "v1",
"kind": "List",
"items": [{
  "apiVersion": "${Namespace.apiVersion}",
  "kind": "${Namespace.kind}",
  "metadata": {"name": "backend"}
}, {
  "apiVersion": "${Role.apiVersion}",
  "kind": "${Role.kind}",
  "metadata": {"name": "my-role"}
}]}`,
        FileFormat.JSON,
      );

      expect(result.getAll()).toEqual([
        {
          apiVersion: Role.apiVersion,
          kind: Role.kind,
          metadata: {
            name: 'my-role',
          },
        },
        {
          apiVersion: Namespace.apiVersion,
          kind: Namespace.kind,
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
      const result = read(
        `
apiVersion: v1
kind: List
`,
        FileFormat.YAML,
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
      expect(() => read(raw, FileFormat.YAML)).toThrow();
    });

    it('throws on encountering simple types', () => {
      const raw = `
apiVersion: v1
kind: List
items:
- {}
`;
      expect(() => read(raw, FileFormat.YAML)).toThrow();
    });
  });
});

describe('write', () => {
  describe('in YAML format', () => {
    it('writes empty Configs as empty List', () => {
      const result = write(new Configs(), FileFormat.YAML);

      expect(result).toEqual(`apiVersion: v1
kind: List
items: []
`);
    });

    it('writes single object', () => {
      const result = write(
        new Configs([
          {
            apiVersion: Namespace.apiVersion,
            kind: Namespace.kind,
            metadata: {
              name: 'foo',
            },
          },
        ]),
        FileFormat.YAML,
      );

      expect(result).toEqual(
        `apiVersion: v1
kind: List
items:
- apiVersion: ${Namespace.apiVersion}
  kind: ${Namespace.kind}
  metadata:
    name: foo
`,
      );
    });

    it('writes multiple objects', () => {
      const result = write(
        new Configs([
          {
            apiVersion: Role.apiVersion,
            kind: Role.kind,
            metadata: {
              name: 'my-role',
            },
          },
          {
            apiVersion: Namespace.apiVersion,
            kind: Namespace.kind,
            metadata: {
              name: 'backend',
            },
          },
        ]),
        FileFormat.YAML,
      );

      expect(result).toEqual(`apiVersion: v1
kind: List
items:
- apiVersion: ${Role.apiVersion}
  kind: ${Role.kind}
  metadata:
    name: my-role
- apiVersion: ${Namespace.apiVersion}
  kind: ${Namespace.kind}
  metadata:
    name: backend
`);
    });
  });

  describe('in JSON format', () => {
    it('parses empty array to empty Configs', () => {
      const result = write(new Configs(), FileFormat.JSON);

      expect(result).toEqual(`{
  "apiVersion": "v1",
  "kind": "List",
  "items": []
}
`);
    });

    it('writes single object', () => {
      const result = write(
        new Configs([
          {
            apiVersion: 'v1',
            kind: 'Namespace',
            metadata: {
              name: 'foo',
            },
          },
        ]),
        FileFormat.JSON,
      );

      expect(result).toEqual(`{
  "apiVersion": "v1",
  "kind": "List",
  "items": [
    {
      "apiVersion": "${Namespace.apiVersion}",
      "kind": "${Namespace.kind}",
      "metadata": {
        "name": "foo"
      }
    }
  ]
}
`);
    });

    it('writes multiple objects', () => {
      const result = write(
        new Configs([
          {
            apiVersion: Role.apiVersion,
            kind: Role.kind,
            metadata: {
              name: 'my-role',
            },
          },
          {
            apiVersion: Namespace.apiVersion,
            kind: Namespace.kind,
            metadata: {
              name: 'backend',
            },
          },
        ]),
        FileFormat.JSON,
      );

      expect(result).toEqual(`{
  "apiVersion": "v1",
  "kind": "List",
  "items": [
    {
      "apiVersion": "${Role.apiVersion}",
      "kind": "${Role.kind}",
      "metadata": {
        "name": "my-role"
      }
    },
    {
      "apiVersion": "${Namespace.apiVersion}",
      "kind": "${Namespace.kind}",
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
