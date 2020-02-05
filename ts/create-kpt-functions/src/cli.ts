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

async function main() {
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

  const dockerBuildHelp = 'Build container images for all functions.';
  const db = subparsers.addParser('docker-build', {
    addHelp: true,
    description: dockerBuildHelp,
    help: dockerBuildHelp,
  });
  db.addArgument('--tag', {
    defaultValue: 'dev',
    help: 'Docker tag used for all function images.',
  });

  const dockerPushHelp = 'Push container images to the registry for all functions.';
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

  // There doesn't seem to be any other way to mark subcommands
  // as optional, so manually add package-create to argv.
  if (process.argv.length === 2) {
    process.argv.push('package-create');
  }

  const args = parser.parseArgs();
  const packageDir = resolve('.');

  switch (args.subcommand) {
    case 'package-create':
      await packageCreate();
      break;
    case 'type-create':
      await typeCreate(packageDir);
      break;
    case 'function-create':
      functionCreate(packageDir);
      break;
    case 'docker-create':
      dockerCreate(packageDir);
      break;
    case 'docker-build':
      dockerBuild(packageDir, args.get('tag'));
      break;
    case 'docker-push':
      dockerPush(packageDir, args.get('tag'));
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
    process.exitCode = 1;
  }
})();
