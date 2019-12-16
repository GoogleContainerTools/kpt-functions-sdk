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

import { spawnSync } from 'child_process';
import { copySync, removeSync } from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import { BUILD_DIR, DEPS_DIR, WORKFLOWS_DIR } from './constants';
import { log } from './log';
import { Templates } from './templates';
import * as validator from './validator';

export function processDocker(packageDir: string, dockerTag: string, func: Function) {
  const dockerRepoBase = process.env.npm_package_dev_kpt_docker_repo_base;
  if (!dockerRepoBase) {
    throw new Error('Env variable not set: npm_package_dev_kpt_docker_repo_base\n');
  }

  const buildDir = path.join(packageDir, BUILD_DIR);
  const depsDir = path.join(packageDir, DEPS_DIR);
  const workflowsDir = path.join(packageDir, WORKFLOWS_DIR);

  try {
    // TODO(b/141115380): Remove this hack when NPM packages are published.
    copySync('/deps', depsDir, { dereference: true, recursive: false });

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
      func(d, workflowsDir, name, image);
    }
  } finally {
    removeSync(depsDir);
  }
}

export function buildFunc(d: string, workflowsDir: string, name: string, image: string) {
  log('Building image...\n');
  const build = spawnSync('docker', ['build', '-q', '-t', image, '-f', d, '.'], {
    stdio: 'inherit',
  });
  if (build.status !== 0) {
    process.exit(1);
  }
}

export function pushFunc(d: string, workflowsDir: string, name: string, image: string) {
  log('\nPushing image...\n');
  // TODO(frankf): prompt before pushing (getYesNo() fro cli-interact).
  const push = spawnSync('docker', ['push', image], { stdio: 'inherit' });
  if (push.status !== 0) {
    process.exit(1);
  }
}

export function genWorkflowConfig(d: string, workflowsDir: string, name: string, image: string) {
  log('\nGenerating workflow configs...\n');
  new Templates([
    {
      outputPath: path.join(workflowsDir, 'argo', `${name}.yaml`),
      templateFile: 'argo.mustache',
      view: {
        name,
        image,
      },
    },
    {
      outputPath: path.join(workflowsDir, 'tekton', `${name}.yaml`),
      templateFile: 'tekton.mustache',
      view: {
        name,
        image,
      },
    },
  ]).render();
}
