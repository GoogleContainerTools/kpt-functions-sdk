/* eslint-disable @typescript-eslint/require-await */
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TestRunner } from './testing';
import { Configs } from './types';
import { generalResult } from './result';
import { isStatus } from './gen/io.k8s.apimachinery.pkg.apis.meta.v1';

const STATUS = {
  apiVersion: 'v1',
  kind: 'Status',
  metadata: { name: 'testObject' },
};
const NON_STATUS = {
  apiVersion: 'v1',
  kind: 'NonStatus',
  metadata: { name: 'testObject' },
};
const ERROR_DESCRIPTION =
  'Description of error written out in great detail\nhere.\n';
const FUNCTION_ERROR = `Functions may add results to propogate error: ${ERROR_DESCRIPTION}`;

async function testFunction(configs: Configs) {
  configs
    .getAll()
    .filter(isStatus)
    .forEach((s) => configs.delete(s));
}
testFunction.usage = `A kpt function used for testing how the test framework handles functions without results`;
const RUNNER = new TestRunner(testFunction);

async function testGeneralResult(configs: Configs) {
  configs.insert(STATUS);
  configs.addResults(generalResult(FUNCTION_ERROR, 'error'));
}
testGeneralResult.usage = `
A kpt function used for testing how the test framework handles functions with general results.
`;
const RESULTS_RUNNER = new TestRunner(testGeneralResult);

describe('test', () => {
  it('empty input, empty output', async () => {
    const input = new Configs([]);
    const output = new Configs([]);

    await RUNNER.assert(input, output);
  });

  it('non-empty input, empty output', async () => {
    const input = new Configs([STATUS]);
    const output = new Configs([]);

    await RUNNER.assert(input, output);
  });

  it('empty input, non-empty output', async () => {
    const input = new Configs([]);
    const output = new Configs([STATUS]);
    output.addResults(generalResult(FUNCTION_ERROR, 'error'));

    await RESULTS_RUNNER.assert(input, output);
  });

  it('non-empty input, non-empty output', async () => {
    const input = new Configs([NON_STATUS]);
    const output = new Configs([NON_STATUS]);

    await RUNNER.assert(input, output);
  });

  it('add results manually', async () => {
    const input = new Configs(undefined);
    const output = new Configs([STATUS]);
    output.addResults({
      severity: 'error',
      message: FUNCTION_ERROR,
    });

    await RESULTS_RUNNER.assert(input, output);
  });

  it('add results using generalResult', async () => {
    const input = new Configs([]);
    const output = new Configs([STATUS]);
    output.addResults(generalResult(FUNCTION_ERROR, 'error'));

    await RESULTS_RUNNER.assert(input, output);
  });
});
