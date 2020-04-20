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

import { Configs, TestRunner, FunctionConfigError } from 'kpt-functions';
import {
  ClusterRoleBinding,
  RoleBinding,
  Subject,
} from './gen/io.k8s.api.rbac.v1';
import { validateRolebinding } from './validate_rolebinding';
import { ConfigMap } from './gen/io.k8s.api.core.v1';

const RUNNER = new TestRunner(validateRolebinding);
const FUNC_CONFIG: ConfigMap = new ConfigMap({
  metadata: { name: 'config' },
  data: { subject_name: 'alice@example.com' },
});

describe(validateRolebinding.name, () => {
  it(
    'passes empty input',
    RUNNER.assertCallback(undefined, undefined, FunctionConfigError)
  );

  it(
    'passes valid RoleBindings',
    RUNNER.assertCallback(
      new Configs(
        [
          roleBinding('alice', {
            name: 'backend-all@example.com',
            kind: 'User',
          }),
        ],
        FUNC_CONFIG
      )
    )
  );

  it(
    'fails invalid RoleBindings',
    RUNNER.assertCallback(
      new Configs(
        [
          roleBinding('alice', {
            name: 'alice@example.com',
            kind: 'User',
          }),
        ],
        FUNC_CONFIG
      ),
      undefined,
      undefined,
      /Found RoleBindings with banned subjects/
    )
  );

  it(
    'ignores ClusterRoleBinding subjects',
    RUNNER.assertCallback(
      new Configs(
        [
          new ClusterRoleBinding({
            metadata: { name: 'alice' },
            roleRef: {
              apiGroup: 'rbac',
              kind: 'Role',
              name: 'alice',
            },
            subjects: [
              {
                name: 'alice@example.com',
                kind: 'User',
              },
            ],
          }),
        ],
        FUNC_CONFIG
      )
    )
  );
});

function roleBinding(name: string, ...subjects: Subject[]): RoleBinding {
  return new RoleBinding({
    metadata: { name },
    roleRef: {
      apiGroup: 'rbac',
      kind: 'Role',
      name: 'alice',
    },
    subjects,
  });
}
