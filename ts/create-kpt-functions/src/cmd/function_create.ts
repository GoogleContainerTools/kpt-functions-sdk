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

import { question } from 'cli-interact';
import * as path from 'path';
import { USER_PACKAGE } from '../paths';
import * as format from '../utils/format';
import { log } from '../utils/log';
import { Templates } from '../utils/templates';
import * as validator from '../utils/validator';

export function functionCreate(appDir: string) {
  const desc = 'Adding a KPT function.';
  log(format.startMarker(desc));

  const defaultFuncName = 'demo_function';
  const funcName = validator.getValidString(
    () => question(`> What is the function name (${defaultFuncName})? `),
    validator.isValidFuncName,
    defaultFuncName,
  );

  log(`Using function name "${funcName}".\n`);

  const tsFuncName = validator.toTSName(funcName);

  const srcDir = path.join(appDir, USER_PACKAGE.src);

  new Templates([
    {
      templateFile: 'func.mustache',
      outputPath: path.join(srcDir, funcName + '.ts'),
      view: {
        func_name: tsFuncName,
      },
    },
    {
      templateFile: 'run.mustache',
      outputPath: path.join(srcDir, funcName + '_run.ts'),
      view: {
        file_name: funcName,
        func_name: tsFuncName,
      },
    },
    {
      templateFile: 'test.mustache',
      outputPath: path.join(srcDir, funcName + '_test.ts'),
      view: {
        file_name: funcName,
        func_name: tsFuncName,
      },
    },
  ]).render();

  log(format.finishMarker(desc));
}
