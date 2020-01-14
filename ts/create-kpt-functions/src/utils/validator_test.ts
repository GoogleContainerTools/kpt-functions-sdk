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

import { disableLogForTesting } from './log';
import { isValidFuncName, MAX_FUNC_NAME_LENGTH, isValidDockerRepo } from './validator';

describe('isValidFuncName', () => {
  disableLogForTesting();

  it('rejects empty names', () => {
    expect(isValidFuncName('')).toBe(false);
  });

  it('allows names exactly the limit long', () => {
    expect(isValidFuncName('a'.repeat(MAX_FUNC_NAME_LENGTH))).toBe(true);
  });

  it('rejects names longer than the limit', () => {
    expect(isValidFuncName('a'.repeat(MAX_FUNC_NAME_LENGTH + 1))).toBe(false);
  });

  it('allows valid names', () => {
    expect(isValidFuncName('a3')).toBe(true);
  });

  it('rejects names not beginning with a lowercase letter', () => {
    expect(isValidFuncName('3a')).toBe(false);
  });

  it('rejects names with invalid characters', () => {
    expect(isValidFuncName('A3')).toBe(false);
  });
});

fdescribe('isValidDockerRepo', () => {
  disableLogForTesting();

  it('rejects empty names', () => {
    expect(isValidDockerRepo('')).toBe(false);
  });

  it('rejects white sapce', () => {
    expect(isValidDockerRepo(' ')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidDockerRepo('%')).toBe(false);
  });

  it('rejects less than 2 paths', () => {
    expect(isValidDockerRepo('hello')).toBe(false);
  });

  it('allows docker hub', () => {
    expect(isValidDockerRepo('hello/world')).toBe(true);
  });

  it('allows trailing slash', () => {
    expect(isValidDockerRepo('hello/hello/')).toBe(true);
  });

  it('allows gcr.io', () => {
    expect(isValidDockerRepo('gr.io/hello/world')).toBe(true);
  });
});
