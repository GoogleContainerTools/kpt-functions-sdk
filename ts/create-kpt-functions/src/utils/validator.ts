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

import * as fs from 'fs';
import { resolve } from 'path';
import { failure, success } from './format';
import { log } from './log';
import validator from 'validator';

export const MAX_FUNC_NAME_LENGTH = 253;

/**
 * Returns whether function name is valid. Otherwise logs why the name is invalid.
 * @param name The name to validate.
 */
export function isValidFuncName(name: string): boolean {
  let isValid = true;

  if (name.length === 0) {
    log('Function name MUST NOT be empty.');
    isValid = false;
  }

  if (name.length > MAX_FUNC_NAME_LENGTH) {
    log('Function name MUST be 253 or fewer characters in length.');
    log(
      success(name.substring(0, MAX_FUNC_NAME_LENGTH)) +
        failure(name.substring(MAX_FUNC_NAME_LENGTH)),
    );
    isValid = false;
  }

  const startsWithLetter = /^[a-z]/;
  if (!startsWithLetter.test(name)) {
    log('Function name MUST begin with a lowercase letter.');
    if (name !== '') {
      log(failure(name.substring(0, 1)) + success(name.substring(1)));
    }
    isValid = false;
  }

  const onlyValidChars = /^[a-z0-9_]+$/;
  if (!validator.matches(name, onlyValidChars)) {
    log("Function name MUST only include lowercase alphanumeric characters and '_'.");
    if (name !== '') {
      log(makeInvalidCharactersRed(name));
    }
    isValid = false;
  }

  // TODO(b/142002037): Test for reserved words.
  return isValid;
}

/**
 * Return whether the given path is either does not exist or is empty.
 */
export function isValidPackageDir(path: string): boolean {
  path = resolve(path);
  if (!fs.existsSync(path)) {
    return true;
  }

  const files = fs.readdirSync(path);
  if (files.length > 0) {
    log(failure(`Directory must be empty. Found: ${files}`));
    return false;
  }
  return true;
}

/**
 * Returns whether given string is a valid NPM package name
 */
export function isValidPackageName(name: string): boolean {
  const isValidNpmName = require('is-valid-npm-name');

  const check: string | true = isValidNpmName(name);

  // `check` is `true` or a String (e.g. why it was not a valid npm name)
  if (check !== true) {
    log(failure(`Package name is not valid: ${check}`));
    return false;
  }
  return true;
}

/**
 * Return whether given string is a valid docker repository.
 *
 * See:
 * https://docs.docker.com/registry/spec/api/#overview
 */
export function isValidDockerRepo(name: string): boolean {
  const pathRegex = '^[a-z0-9]+(?:[._-][a-z0-9]+)*$';
  if (name.endsWith('/')) {
    log(failure(`Trailing slash is not allowed`));
    return false;
  }
  const paths = name.split('/');
  if (paths.length < 2) {
    log(failure(`Need at least 2 path components`));
    return false;
  }
  for (const p of paths) {
    if (!p.match(pathRegex)) {
      log(failure(`Invalid path component: ${p}`));
      return false;
    }
  }
  return true;
}

/**
 * Calls readString until it produces one for which isValid returns true.
 *
 * Validates each potential name readString provides.
 *
 * @param isValid A predicate which returns true if the passed string is valid.
 * @param readString A callback producing a string to be validated.
 * @param defaultString The initial value to suggest to the user.
 */
export function getValidString(
  readString: () => string,
  isValid: (s: string) => boolean,
  defaultString?: string,
): string {
  let str;
  do {
    str = readString();
    if (str === '' && defaultString) {
      str = defaultString;
    }
  } while (!isValid(str));
  return str;
}

function makeInvalidCharactersRed(s: string) {
  const invalidChars = /([^a-z0-9_])/;
  // Splits text at the boundaries of good and bad characters.
  const invalidCharSplit = /((?<=[a-z0-9_])(?=[^a-z0-9_])|(?<=[^a-z0-9_])(?=[a-z0-9_]))/;
  const splits: string[] = s.split(invalidCharSplit);

  return splits.map((str) => (invalidChars.test(str) ? failure(str) : success(str))).join('');
}

/**
 * Turns a user-provided function name into a Typescript function name.
 */
export function toTSName(funcName: string): string {
  return funcName
    .split('_')
    .map((value, index) => {
      if (index === 0) {
        return value;
      }
      return value.charAt(0).toUpperCase() + value.substring(1);
    })
    .join('');
}

/**
 * Turns a user-provided function name into a Docker function name.
 */
export function toDockerName(funcName: string): string {
  return funcName.split('_').join('-');
}

export function isEmptyOrMaxInt(max: number): (s: string) => boolean {
  return (s: string) => {
    if (validator.isInt(s, { min: 0, max: max })) {
      return true;
    }
    log(`Must enter a number from 0 to ${max}.`);
    return false;
  };
}
