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

import * as path from 'path';
import { USER_PACKAGE } from '../paths';
import { log } from '../utils/log';
import { Templates } from '../utils/templates';
import { processDockerfile } from './docker_create';

export function workflowCreate(packageDir: string, dockerTag: string) {
  log('\nGenerating workflow configs...\n');
  const workflowsDir = path.join(packageDir, USER_PACKAGE.workflows);
  processDockerfile(packageDir, dockerTag, (dockerFile, functionName, image) => {
    new Templates([
      {
        outputPath: path.join(workflowsDir, 'argo', `${functionName}.yaml`),
        templateFile: 'argo.mustache',
        view: {
          functionName,
          image,
        },
      },
      {
        outputPath: path.join(workflowsDir, 'tekton', `${functionName}.yaml`),
        templateFile: 'tekton.mustache',
        view: {
          functionName,
          image,
        },
      },
    ]).render();
  });
}
