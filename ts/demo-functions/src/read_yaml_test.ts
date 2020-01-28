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

import * as kpt from '@googlecontainertools/kpt-functions';
import * as path from 'path';
import { readYaml, SOURCE_DIR } from './read_yaml';
import { ConfigMap } from './gen/io.k8s.api.core.v1';

const RUNNER = new kpt.TestRunner(readYaml);

describe('readYaml', () => {
  let functionConfig = ConfigMap.named('config');
  functionConfig.data = {};

  it('works on empty dir', async () => {
    const sourceDir = path.resolve(__dirname, '../test-data/source/empty');
    functionConfig.data![SOURCE_DIR] = sourceDir;
    const configs = new kpt.Configs(undefined, functionConfig);

    await readYaml(configs);

    expect(configs.getAll().length).toBe(0);
  });

  it('replicates test dir', async () => {
    const sourceDir = path.resolve(__dirname, '../test-data/source/foo-yaml');
    const expectedIntermediateFile = path.resolve(__dirname, '../test-data/intermediate/foo.yaml');
    const expectedConfigs = kpt.readConfigs(expectedIntermediateFile, kpt.FileFormat.YAML);
    functionConfig.data![SOURCE_DIR] = sourceDir;
    const actualConfigs = new kpt.Configs(undefined, functionConfig);

    await RUNNER.assert(actualConfigs, expectedConfigs);
  });

  it('fails for invalid KubernetesObjects', async () => {
    const sourceDir = path.resolve(__dirname, '../test-data/source/invalid');
    functionConfig.data![SOURCE_DIR] = sourceDir;
    const actualConfigs = new kpt.Configs(undefined, functionConfig);

    await RUNNER.assert(actualConfigs, undefined, kpt.MultiConfigError);
  });
});
