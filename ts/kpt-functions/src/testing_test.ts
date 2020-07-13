/**
 * Copyright 2020 Google LLC
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

import { TestRunner } from './testing';
import { Configs, Result } from './types';
import { generalResult } from './result';

const ERROR_DESCRIPTION =
  'Description of error written out in great detail\nhere.\n';
const FUNCTION_ERROR = `Functions may add results to propogate error: ${ERROR_DESCRIPTION}`;

async function testGeneralResult(configs: Configs) {
  configs.addResults(generalResult(FUNCTION_ERROR, 'error'));
}

testGeneralResult.usage = `
A kpt function used for testing how the test framework handles general results.
`;

const RUNNER = new TestRunner(testGeneralResult);

describe('test', () => {
  it('add results manually', async () => {
    const input = new Configs(undefined);
    const output = new Configs(undefined);
    const errorResult: Result = {
      severity: 'error',
      message: FUNCTION_ERROR,
    };
    output.addResults(errorResult);

    await RUNNER.assert(input, output);
  });

  it('add results using generalResult', async () => {
    const input = new Configs(undefined);
    const output = new Configs(undefined);
    output.addResults(generalResult(FUNCTION_ERROR, 'error'));

    await RUNNER.assert(input, output);
  });
});
