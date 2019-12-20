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

import { question } from 'cli-interact';
import * as path from 'path';
import { isEmpty } from 'validator';
import { addFunc } from './add_func';
import * as format from './format';
import { log } from './log';
import { createDockerfiles } from './process_docker';
import { Templates } from './templates';
import { updateGeneratedTypes } from './update_generated_types';
import * as validator from './validator';

export async function createPackage() {
  const pkgDir = initializePackage();

  // TODO(b/142241787): Don't just crash if type generation fails. Handle this gracefully.
  // TODO(b/142242496): Add option to skip type generation.
  await updateGeneratedTypes(pkgDir);

  addFunc(pkgDir);
  createDockerfiles(pkgDir);

  log(
    format.success('Success!') +
      ' Run `npm install` next to install dependencies and build the package.\n',
  );
}

export function initializePackage() {
  const desc = 'Initializing the NPM package';
  log(format.startMarker(desc));

  // Prompt for package dir.
  const defaultPackageDir = path.resolve('.');
  const packageDir = path.resolve(
    validator.getValidString(
      () =>
        question(
          `> What is the absolute path where the package is located (${defaultPackageDir})? `,
        ),
      validator.isValidDirectory,
      defaultPackageDir,
    ),
  );

  log(`Using package path ${packageDir}.\n`);

  // Prompt for package name.
  const defaultPackageName = path.basename(packageDir);
  const packageName = validator.getValidString(
    () => question(`> What is the package name (${defaultPackageName})? `),
    validator.isValidPackageName,
    defaultPackageName,
  );

  log(`Using package name ${packageName}.\n`);

  // Prompt for docker registry url.
  const defaultDockerRepoBase = 'gcr.io/kpt-functions-demo';
  const dockerRepoBase = validator.getValidString(
    () =>
      question(
        `> What is the docker repository prefix where this package's functions will be published (${defaultDockerRepoBase})? `,
      ),
    (s) => !isEmpty(s),
    defaultDockerRepoBase,
  );

  log(`Using docker repository prefix ${defaultDockerRepoBase}.\n`);

  new Templates([
    {
      templateFile: 'package.json.mustache',
      outputPath: path.join(packageDir, 'package.json'),
      view: {
        package_name: packageName,
        // TODO(b/141115380): Remove this hack when NPM packages are published.
        kpt_functions_path: 'file:/deps/kpt-functions/kpt-functions-0.0.1.tgz',
        docker_repo_base: dockerRepoBase,
      },
    },
    {
      templateFile: 'jasmine.json',
      outputPath: path.join(packageDir, 'jasmine.json'),
    },
    {
      templateFile: 'tsconfig.json',
      outputPath: path.join(packageDir, 'tsconfig.json'),
    },
    {
      templateFile: 'dockerignore',
      outputPath: path.join(packageDir, '.dockerignore'),
    },
  ]).render();

  log(format.finishMarker(desc));
  return packageDir;
}
