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
   * Runs the KptFunc and asserts the expected output or exception.
   * 
   * Example usage:
   * 
   * const RUNNER = new TestRunner(myFunc);
   * 
   * it('function is a NO OP', async () => {
   *   await RUNNER.assert());
   * };
   *
   * @param input input Configs passed to the function. It is deep-copied before running the function.
   *   If undefined, assumes an empty Configs.
   * @param expectedOutput expected resultant Configs after KptFunc has successfully completed.
   *   If undefined, assumes the output should remain unchanged (NO OP).
   * @param expectException expected exception to be thrown. If given, expectedOutput is ignored.
   * @param expectExceptionMessage expected message of expection to be thrown. If given, expectedOutput is ignored.
   */
  async assert(
    input: Configs = new Configs(),
    expectedOutput?: Configs,
    expectedException?: new (...args: any[]) => Error,
    expectedExceptionMessage?: string | RegExp
  ){
    await testFn(this.fn, input, expectedOutput, expectedException, expectedExceptionMessage);
  }

  /**
   * Similar to [[assert]] method, but instead returns an assertion function that can be passed directly to 'it'.
   * 
   * Example usage:
   * 
   * const RUNNER = new TestRunner(myFunc);
   * 
   * it('function is a NO OP', RUNNER.assertCallback());
   */
  assertCallback(
    input: Configs = new Configs(),
    expectedOutput?: Configs,
    expectedException?: new (...args: any[]) => Error,
    expectedExceptionMessage?: string | RegExp
  ): () => Promise<void> {
    return async () => await this.assert(input, expectedOutput, expectedException, expectedExceptionMessage);
  }
}

async function testFn(
  fn: KptFunc,
  input: Configs = new Configs(),
  expectedOutput?: Configs,
  expectedException?: new (...args: any[]) => Error,
  expectedExceptionMessage?: string | RegExp
) {
  // We must clone the input as the function may mutate its input Configs.
  const configs = deepClone(input);

  if (expectedException) {
      await expectAsync(fn(configs)).toBeRejectedWithError(expectedException, expectedExceptionMessage);
      return;
  } else if (expectedExceptionMessage) {
      await expectAsync(fn(configs)).toBeRejectedWithError(expectedExceptionMessage);
      return;
  }

  await fn(configs);

  expect(valueOf(configs)).toEqual(valueOf(expectedOutput) || valueOf(input));
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
