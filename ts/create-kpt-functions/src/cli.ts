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

async function main() {
  // TODO: Add usage examples.
  const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Create or update an NPM package.',
  });

  const subparsers = parser.addSubparsers({
    title: 'subcommands',
    dest: 'subcommand',
  });

  const packageCreateHelp = 'Create a new NPM package.';
  subparsers.addParser('package-create', {
    addHelp: true,
    description: packageCreateHelp,
    help: packageCreateHelp,
  });

  const dockerCreateHelp =
    'Create Dockerfiles for all functions in an NPM package. Overwrite files if they exist.';
  subparsers.addParser('docker-create', {
    addHelp: true,
    description: dockerCreateHelp,
    help: dockerCreateHelp,
  });

  const dockerBuildHelp = 'Build docker images for all functions in an NPM package.';
  const dockerBuild = subparsers.addParser('docker-build', {
    addHelp: true,
    description: dockerBuildHelp,
    help: dockerBuildHelp,
  });
  dockerBuild.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const dockerPushHelp = 'Push docker images for all functions in an NPM package.';
  const dockerPush = subparsers.addParser('docker-push', {
    addHelp: true,
    description: dockerPushHelp,
    help: dockerPushHelp,
  });
  dockerPush.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const functionCreateHelp = 'Create a function in an NPM package.';
  subparsers.addParser('function-create', {
    addHelp: true,
    description: functionCreateHelp,
    help: functionCreateHelp,
  });

  const typeCreateHelp =
    'Create or update client code in an existing NPM package based on CRDs from a kubeconfig context.';
  subparsers.addParser('type-create', {
    addHelp: true,
    description: typeCreateHelp,
    help: typeCreateHelp,
  });

  const workflowConfigCreateHelp =
    'Create workflow configs for all functions in an NPM package. Overwrite configs if they exist.';
  const workflowConfigCreate = subparsers.addParser('workflow-config-create', {
    addHelp: true,
    description: workflowConfigCreateHelp,
    help: workflowConfigCreateHelp,
  });
  workflowConfigCreate.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  // There doesn't seem to be any other way to mark subcommands
  // as optional, so manually add package-create to argv.
  if (process.argv.length === 2) {
    process.argv.push('package-create');
  }

  const args = parser.parseArgs();

  // TODO(b/141943296): Ensure subcommands handle choosing the package directory
  switch (args.subcommand) {
    case 'package-create':
      await createPackage();
      break;
    case 'type-create':
      await updateGeneratedTypes(resolve('.'));
      break;
    case 'function-create':
      addFunc(resolve('.'));
      break;
    case 'docker-create':
      createDockerfiles(resolve('.'));
      break;
    case 'docker-build':
      processDocker(resolve('.'), args.get('tag'), buildFunc);
      break;
    case 'docker-push':
      processDocker(resolve('.'), args.get('tag'), pushFunc);
      break;
    case 'workflow-config-create':
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
