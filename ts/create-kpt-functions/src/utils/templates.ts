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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { render } from 'mustache';
import { dirname, isAbsolute, join } from 'path';
import { CLI_PACKAGE } from '../paths';
import { log } from './log';

interface Template {
  // Template file relative to TEMPLATE_DIR
  templateFile: string;
  // Absolute path to the output file.
  // If the parent directory doesn't exit, it will be created recursively.
  outputPath: string;
  // Values to substitude in the template.
  view?: any;
}

export class Templates {
  constructor(private templates: Template[]) {}

  public render() {
    for (const t of this.templates) {
      const before = readFileSync(
        join(CLI_PACKAGE.templates, t.templateFile),
        'utf8'
      ).toString();
      const after = t.view ? render(before, t.view) : before;
      if (!isAbsolute(t.outputPath)) {
        throw new Error(`outputPath must be absolute: ${t.outputPath}`);
      }
      const parentDir = dirname(t.outputPath);
      if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
      }
      writeFileSync(t.outputPath, after);
      log(`Generated ${t.outputPath}`);
    }
  }
}
