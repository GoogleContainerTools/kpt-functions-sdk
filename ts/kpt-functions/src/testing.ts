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

import { fail } from 'assert';
import { ConfigError, Configs, isConfigError, KptFunc } from './types';

/**
 * TestRunner generates callbacks for test frameworks to execute as tests.
 *
 * Use to test behavior such as mutating configs, validation functions that return ConfigErrors, and
 * functions expected to throw exceptions.
 */
export class TestRunner {
  constructor(private readonly fn: KptFunc) {}

  /**
   * Generates a callback for a test framework to execute.
   *
   * @param input is the initial set of Configs to test.
   *   By default assumes an empty set of Configs.
   * @param expectedOutput is the expected resulting Configs or ConfigError produced by the KptFunc.
   *   If undefined, assumes the output should remain unchanged.
   * @param expectException indicates that KptFunc is expected to throw an exception if true.
   */
  run(
    input: Configs = new Configs(),
    expectedOutput?: Configs | ConfigError,
    expectException?: boolean,
  ): () => void {
    return new TestCase(this.fn, input, expectedOutput, expectException).run();
  }
}

/**
 * TestCase is a specific test to execute to verify the behavior of a KptFunc.
 */
class TestCase {
  constructor(
    private readonly fn: KptFunc,
    private readonly input: Configs = new Configs(),
    private readonly expectedOutput?: Configs | ConfigError,
    private readonly expectException?: boolean,
  ) {}

  public run(): () => void {
    return () => {
      // We must clone the input as runner.fn may mutate its input Configs.
      const configs = JSON.parse(JSON.stringify(this.input));

      let configError: ConfigError | void;
      let caughtException = false;
      try {
        configError = this.fn(configs);
      } catch (e) {
        // The KptFunc threw an exception.
        caughtException = true;
        if (!this.expectException) {
          // We didn't expect an exception, but got one.
          fail(`Unexpected exception: ${e.toString()}`);
        }
      } finally {
        if (this.expectException && !caughtException) {
          fail('Expected exception.');
        }
      }

      if (isConfigError(this.expectedOutput)) {
        // We expect an error.
        if (isConfigError(configError)) {
          // We got an error.
          // TODO(b/142072352): More fine-grained checking of the actual error thrown may be required. As-is just
          //  answers "yes, a ConfigError was expected and one was thrown."
        } else {
          // We did not get an error.
          fail('Expected ConfigError but got undefined.');
        }
        return;
      } else if (isConfigError(configError)) {
        fail('Unexpected ConfigError');
      }

      // TODO(b/142056564): Print human-readable diffs.
      //  We know the configs are sorted, but not elements of sub-fields which are arrays.
      //  The comparison doesn't try to smartly find plausible near-misses in the case of missing
      //  elements, so missing the first element of 8 will throw a large, hard-to-read error message.
      expect(configs).toEqual(this.expectedOutput || this.input);
    };
  }
}
