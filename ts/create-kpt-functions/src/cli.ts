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
    description: 'KPT functions CLI.',
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

  const dockerCreateHelp = 'Generate Dockerfiles for all functions. Overwrite files if they exist.';
  subparsers.addParser('docker-create', {
    addHelp: true,
    description: dockerCreateHelp,
    help: dockerCreateHelp,
  });

  const dockerBuildHelp = 'Build docker images for all functions.';
  const dockerBuild = subparsers.addParser('docker-build', {
    addHelp: true,
    description: dockerBuildHelp,
    help: dockerBuildHelp,
  });
  dockerBuild.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const dockerPushHelp = 'Push docker images to the registry for all functions.';
  const dockerPush = subparsers.addParser('docker-push', {
    addHelp: true,
    description: dockerPushHelp,
    help: dockerPushHelp,
  });
  dockerPush.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const functionCreateHelp = 'Generate stubs for a new function. Overwrites files if they exist.';
  subparsers.addParser('function-create', {
    addHelp: true,
    description: functionCreateHelp,
    help: functionCreateHelp,
  });

  const typeCreateHelp = 'Generate classes for core and CRD types. Overwrite files if they exist.';
  subparsers.addParser('type-create', {
    addHelp: true,
    description: typeCreateHelp,
    help: typeCreateHelp,
  });

  const workflowCreateHelp =
    'Generate workflow configs for all functions. Overwrite configs if they exist.';
  const workflowCreate = subparsers.addParser('workflow-create', {
    addHelp: true,
    description: workflowCreateHelp,
    help: workflowCreateHelp,
  });
  workflowCreate.addArgument('--tag', {
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
    case 'workflow-create':
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
