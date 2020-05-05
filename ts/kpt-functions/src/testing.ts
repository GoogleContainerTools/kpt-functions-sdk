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

import { Configs, KptFunc } from './types';

/**
 * TestRunner makes it easy to write unit tests for KPT functions.
 */
export class TestRunner {
  constructor(private readonly fn: KptFunc) {}

  /**
   * Runs the KptFunc and asserts the expected output or error.
   *
   * Example usage:
   *
   * ```
   * const RUNNER = new TestRunner(myFunc);
   *
   * it('function is a NO OP', async () => {
   *   await RUNNER.assert());
   * };
   * ```
   *
   * @param input input Configs passed to the function. It is deep-copied before running the function.
   *   If undefined, assumes an empty Configs.
   * @param expectedOutput expected resultant Configs after running the function regardless of success or failure.
   *  Use 'unchanged' if the function is not expected to change input Configs.
   * @param expectedErrorType expected error type to be thrown.
   * @param expectedErrorMessage expected message of expection to be thrown.
   */
  async assert(
    input: Configs = new Configs(),
    expectedOutput?: Configs | 'unchanged',
    expectedErrorType?: new (...args: any[]) => Error,
    expectedErrorMessage?: string | RegExp,
  ) {
    await testFn(
      this.fn,
      input,
      expectedOutput,
      expectedErrorType,
      expectedErrorMessage,
    );
  }

  /**
   * Similar to [[assert]] method, but instead returns an assertion function that can be passed directly to 'it'.
   *
   * Example usage:
   *
   * ```
   * const RUNNER = new TestRunner(myFunc);
   *
   * it('function is a NO OP', RUNNER.assertCallback());
   * ```
   *
   * @param input input Configs passed to the function. It is deep-copied before running the function.
   *   If undefined, assumes an empty Configs.
   * @param expectedOutput expected resultant Configs after running the function regardless of success or failure.
   *  Use 'unchanged' if the function is not expected to change input Configs.
   * @param expectedErrorType expected error type to be thrown.
   * @param expectedErrorMessage expected message of expection to be thrown.
   */
  assertCallback(
    input: Configs = new Configs(),
    expectedOutput?: Configs | 'unchanged',
    expectedErrorType?: new (...args: any[]) => Error,
    expectedErrorMessage?: string | RegExp,
  ): () => Promise<void> {
    return async () =>
      await this.assert(
        input,
        expectedOutput,
        expectedErrorType,
        expectedErrorMessage,
      );
  }
}

async function testFn(
  fn: KptFunc,
  input: Configs = new Configs(),
  expectedOutput?: Configs | 'unchanged',
  expectedErrorType?: new (...args: any[]) => Error,
  expectedErrorMessage?: string | RegExp,
) {
  // We must clone the input as the function may mutate its input Configs.
  const configs = deepClone(input);

  const matcher = expectAsync(fn(configs));

  if (expectedErrorType) {
    await matcher.toBeRejectedWithError(
      expectedErrorType,
      expectedErrorMessage
    );
  } else if (expectedErrorMessage) {
    await matcher.toBeRejectedWithError(expectedErrorMessage);
  } else if (expectedOutput) {
    await matcher.toBeResolved();
  } else {
    throw new Error(
      'Either specify expectedOutput or one of expectedError* parameters'
    );
  }

  if (expectedOutput) {
    let o: Configs;
    if (expectedOutput === 'unchanged') {
      o = input;
    } else {
      o = expectedOutput;
    }
    expect(valueOf(configs)).toEqual(valueOf(o));
  }
}

function deepClone(configs: Configs): Configs {
  const items = JSON.parse(JSON.stringify(configs.getAll()));
  const functionConfig =
    configs.getFunctionConfig() &&
    JSON.parse(JSON.stringify(configs.getFunctionConfig()));
  return new Configs(items, functionConfig);
}

function valueOf(configs?: Configs) {
  return configs && JSON.parse(JSON.stringify(configs.getAll()));
}
