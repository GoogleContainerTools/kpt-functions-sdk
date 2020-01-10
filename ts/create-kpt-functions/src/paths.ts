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

import { resolve } from 'path';
import * as os from 'os';

// Absolute paths in this package.
export const CLI_PACKAGE = {
  typegen: resolve(__dirname, '..', 'bin', typegenBin()),
  templates: resolve(__dirname, '..', 'templates'),
};

function typegenBin(): string {
  let arch;
  switch (os.arch()) {
    case 'x64':
      arch = 'amd64';
      break;
    default:
      throw new Error(`${os.arch()} architecture not currently support`);
  }

  let platform;
  switch (os.platform()) {
    case 'linux':
      platform = 'linux';
      break;
    case 'darwin':
      platform = 'darwin';
      break;
    case 'win32':
      platform = 'windows';
      break;
    default:
      throw new Error(`${os.platform()} OS not currently support`);
  }

  return `typegen_${platform}_${arch}`;
}

// Paths relative to user package.
export const USER_PACKAGE = {
  src: 'src',
  build: 'build',
  workflows: 'workflows',
};
