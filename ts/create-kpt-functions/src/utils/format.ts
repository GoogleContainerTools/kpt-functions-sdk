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

import chalk from 'chalk';

/**
 * Formats an input string to indicate nothing is wrong.
 */
export function success(s: string): string {
  return chalk.green(s);
}

/**
 * Formats an input string to indicate an error condition.
 */
export function failure(s: string): string {
  return chalk.red(chalk.bold(s));
}

/**
 * Marks the starting point of an operation.
 */
export function startMarker(s: string): string {
  return chalk.bold(`\nStarting: ${s}\n`);
}

/**
 * Marks the ending point of an operation that was completed successfully.
 */
export function finishMarker(s: string): string {
  return success(`\nCompleted: ${s}\n`);
}
