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
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync } from 'fs';
import { removeSync } from 'fs-extra';
import { tmpdir } from 'os';
import * as path from 'path';
import { log } from './log';

const INPUT_FILE = 'input.json';
const OUTPUT_FILE = 'output.json';

export function runLocal(parser: ArgumentParser) {
  parser.addArgument('FUNCTION_NAME', {
    help: 'Name of the kpt function to execute',
  });

  parser.addArgument('--source_dir', {
    help: 'Path to the source config directory',
    required: true,
  });

  parser.addArgument('--sink_dir', {
    help: 'Path to the config directory to be created',
  });

  parser.addArgument('--overwrite', {
    action: 'storeTrue',
    help: `If enabled, recursively looks for all YAML files in the directory to overwrite.

If --sink_dir is defined, overwrites YAML files in --sink_dir.
If --sink_dir is not defined, overwrites YAML files in --source_dir.

If would write KubernetesObjects to a file that does not exist, creates the file.
If would modify the contents of a file, modifies the file.
If would not modify the contents of a YAML file, does nothing.
If would write no KubernetesObjects to a file, deletes the YAML file if it exists.`,
  });

  const args = parser.parseKnownArgs();
  const props = args[0];

  const overwrite = props.overwrite === 'true';
  if (props.sink_dir === null && !overwrite) {
    parser.error('Either --sink_dir must be defined or --overwrite must be passed.');
  }

  // TODO(b/141751018): Allow specifying source/sink functions.
  const fnName = props.FUNCTION_NAME;
  // Resolve turns paths into their absolute forms as required for the docker -v flag.
  const sourceDir = path.resolve(props.source_dir);
  const sinkDir = path.resolve(props.sink_dir || sourceDir);

  // Get new temporary directory.
  const tmp = mkdtempSync(path.join(tmpdir(), 'kpt-'));

  try {
    const runArgs = (args[1] as string[]).concat(
      '--input',
      `${tmp}/${INPUT_FILE}`,
      '--output',
      `${tmp}/${OUTPUT_FILE}`,
    );

    source(sourceDir, tmp);
    run(fnName, tmp, runArgs);
    sink(tmp, sinkDir, overwrite);
  } catch (e) {
    log(e);
    process.exitCode = 1;
  } finally {
    removeSync(tmp);
  }
}

function source(sourceDir: string, tmp: string) {
  // We have to manually create these directories before passing them as Bind Mounts to Docker, or they will be
  // created with root:root permissions.
  if (!existsSync(sourceDir)) {
    mkdirSync(sourceDir);
  }
  // The --user flag sets the running user/group as the current one, meaning users don't have to sudo to delete files.
  const containerSourcePath = '/tmp/source_dir';
  const containerInputListPath = '/tmp/input';
  const args = [
    'run',
    '--user',
    `${process.getuid()}:${process.getgid()}`,
    '--volume',
    `${sourceDir}:${containerSourcePath}`,
    '--volume',
    `${tmp}:${containerInputListPath}`,
    'gcr.io/kpt-functions/source-yaml-dir:latest',
    '--source_dir',
    containerSourcePath,
    '--output',
    `${containerInputListPath}/${INPUT_FILE}`,
  ];
  spawnSync('docker', args, { stdio: 'inherit' });
}

function run(fnName: string, tmp: string, args: string[]) {
  const nodeArgs = [`dist/${fnName}_run.js`, ...args];
  spawnSync('node', nodeArgs, { stdio: 'inherit' });
}

function sink(tmp: string, sinkDir: string, overwrite: boolean) {
  if (!existsSync(sinkDir)) {
    mkdirSync(sinkDir);
  }
  const containerSinkPath = '/tmp/sink_dir';
  const containerOutputListPath = '/tmp/output';
  let args = [
    `run`,
    '--user',
    `${process.getuid()}:${process.getgid()}`,
    '--volume',
    `${tmp}:${containerOutputListPath}`,
    '--volume',
    `${sinkDir}:${containerSinkPath}`,
    'gcr.io/kpt-functions/sink-yaml-dir:dev', // TODO: Make :latest once PR is approved.
    '--input',
    `${containerOutputListPath}/${OUTPUT_FILE}`,
    '--sink_dir',
    containerSinkPath,
  ];
  if (overwrite) {
    args = args.concat('--overwrite', 'true');
  }
  spawnSync('docker', args, { stdio: 'inherit' });
}
