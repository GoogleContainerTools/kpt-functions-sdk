#!/usr/bin/env node
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

import { ArgumentParser } from 'argparse';
import { resolve } from 'path';
import { createPackage } from './create_package';
import { updateGeneratedTypes } from './update_generated_types';
import { addFunc } from './add_func';
import {
  buildFunc,
  createDockerfiles,
  pushFunc,
  genWorkflowConfig,
  processDocker,
} from './process_docker';
import { runLocal } from './run_local';

async function main() {
  // TODO: Add usage examples.
  const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Create or update a NPM package.',
  });

  const subparsers = parser.addSubparsers({
    title: 'subcommands',
    dest: 'subcommand',
  });

  const createPackageHelp = 'Create a new NPM package.';
  subparsers.addParser('create-package', {
    addHelp: true,
    description: createPackageHelp,
    help: createPackageHelp,
  });

  const updateTypesHelp = 'Update generated types for an existing NPM package.';
  subparsers.addParser('update-generated-types', {
    addHelp: true,
    description: updateTypesHelp,
    help: updateTypesHelp,
  });

  const addFuncHelp = 'Add a new function to a NPM package.';
  subparsers.addParser('add-function', {
    addHelp: true,
    description: addFuncHelp,
    help: addFuncHelp,
  });

  const createDockHelp =
    'Create Dockerfiles for all functions in an NPM package. Overwrite files if they exist.';
  subparsers.addParser('create-dockerfiles', {
    addHelp: true,
    description: createDockHelp,
    help: createDockHelp,
  });

  const buildFuncsHelp = 'Build docker images for all functions in an NPM package.';
  const buildFunctions = subparsers.addParser('build-functions', {
    addHelp: true,
    description: buildFuncsHelp,
    help: buildFuncsHelp,
  });
  buildFunctions.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const pushFuncsHelp = 'Push docker images for all functions in an NPM package.';
  const pushFunctions = subparsers.addParser('push-functions', {
    addHelp: true,
    description: pushFuncsHelp,
    help: pushFuncsHelp,
  });
  pushFunctions.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const genWorkflowConfigsHelp = 'Generate workflow configs for all functions in an NPM package.';
  const genWorkflowConfigs = subparsers.addParser('gen-workflow-configs', {
    addHelp: true,
    description: genWorkflowConfigsHelp,
    help: genWorkflowConfigsHelp,
  });
  genWorkflowConfigs.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const runLocalHelp = 'Run a kpt function locally.';
  subparsers.addParser('run-local', {
    addHelp: true,
    description: runLocalHelp,
    help: runLocalHelp,
  });

  // There doesn't seem to be any other way to mark subcommands
  // as optional, so manually add create-package to argv.
  if (process.argv.length === 2) {
    process.argv.push('create-package');
  }

  if (process.argv[2] === 'run-local') {
    // parser.parseArgs() simply fails if it sees any unregistered flags, which we have to allow
    // to support user-specified properties.
    runLocal(parser);
    return;
  }

  const args = parser.parseArgs();

  // TODO(b/141943296): Ensure subcommands handle choosing the package directory
  switch (args.subcommand) {
    case 'create-package':
      await createPackage();
      break;
    case 'update-generated-types':
      await updateGeneratedTypes(resolve('.'));
      break;
    case 'add-function':
      addFunc(resolve('.'));
      break;
    case 'create-dockerfiles':
      createDockerfiles(resolve('.'));
      break;
    case 'build-functions':
      processDocker(resolve('.'), args.get('tag'), buildFunc);
      break;
    case 'push-functions':
      processDocker(resolve('.'), args.get('tag'), pushFunc);
      break;
    case 'gen-workflow-configs':
      processDocker(resolve('.'), args.get('tag'), genWorkflowConfig);
      break;
    default:
      parser.exit(1, 'invalid args');
  }
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();
