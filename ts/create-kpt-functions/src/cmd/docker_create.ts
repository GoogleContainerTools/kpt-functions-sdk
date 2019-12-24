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

import * as glob from 'glob';
import * as path from 'path';
import { USER_PACKAGE } from '../paths';
import { log } from '../utils/log';
import { Templates } from '../utils/templates';
import * as validator from '../utils/validator';

export function dockerCreate(packageDir: string) {
  const srcDir = path.join(packageDir, USER_PACKAGE.src);
  const buildDir = path.join(packageDir, USER_PACKAGE.build);

  const funcFiles = glob.sync(path.join(srcDir, '*_run.ts'));
  log(`Found ${funcFiles.length} function(s).\n`);

  for (const f of funcFiles) {
    const name = path.basename(f, '_run.ts');
    new Templates([
      {
        templateFile: 'Dockerfile.mustache',
        outputPath: path.join(buildDir, name + '.Dockerfile'),
        view: {
          file_name: name + '_run.js',
        },
      },
    ]).render();
  }
}

export type ConsumeDockerfiles = (dockerFile: string, functionName: string, image: string) => void;

export function processDocker(packageDir: string, dockerTag: string, func: ConsumeDockerfiles) {
  const dockerRepoBase = process.env.npm_package_dev_kpt_docker_repo_base;
  if (!dockerRepoBase) {
    throw new Error('Env variable not set: npm_package_dev_kpt_docker_repo_base\n');
  }

  const buildDir = path.join(packageDir, USER_PACKAGE.build);

  const dockerFiles = glob.sync(path.join(buildDir, '*.Dockerfile'));
  log(`Found ${dockerFiles.length} Dockerfile(s).\n`);

  for (const d of dockerFiles) {
    const name = validator.toDockerName(path.basename(d, '.Dockerfile'));
    const image = `${dockerRepoBase}/${name}:${dockerTag}`;
    const border = '='.repeat(50);
    log('');
    log(border);
    log(image);
    log(border);
    func(d, name, image);
  }
}
