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
import { packageCreate } from './cmd/package_create';
import { typeCreate } from './cmd/type_create';
import { functionCreate } from './cmd/function_create';
import { dockerCreate } from './cmd/docker_create';
import { dockerBuild } from './cmd/docker_build';
import { dockerPush } from './cmd/docker_push';
import { workflowCreate } from './cmd/workflow_create';

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
  const db = subparsers.addParser('docker-build', {
    addHelp: true,
    description: dockerBuildHelp,
    help: dockerBuildHelp,
  });
  db.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const dockerPushHelp = 'Push docker images to the registry for all functions.';
  const dp = subparsers.addParser('docker-push', {
    addHelp: true,
    description: dockerPushHelp,
    help: dockerPushHelp,
  });
  dp.addArgument('--tag', {
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
  const wc = subparsers.addParser('workflow-create', {
    addHelp: true,
    description: workflowCreateHelp,
    help: workflowCreateHelp,
  });
  wc.addArgument('--tag', {
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
      await packageCreate();
      break;
    case 'type-create':
      await typeCreate(resolve('.'));
      break;
    case 'function-create':
      functionCreate(resolve('.'));
      break;
    case 'docker-create':
      dockerCreate(resolve('.'));
      break;
    case 'docker-build':
      dockerBuild(resolve('.'), args.get('tag'));
      break;
    case 'docker-push':
      dockerPush(resolve('.'), args.get('tag'));
      break;
    case 'workflow-create':
      workflowCreate(resolve('.'), args.get('tag'));
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
