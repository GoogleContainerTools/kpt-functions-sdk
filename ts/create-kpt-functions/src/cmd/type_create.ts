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

import { KubeConfig } from '@kubernetes/client-node';
import { Context } from '@kubernetes/client-node/dist/config_types';
import { question } from 'cli-interact';
import { mkdtempSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { resolve, delimiter } from 'path';
import * as request from 'request-promise';
import * as format from '../utils/format';
import { log } from '../utils/log';
import * as validator from '../utils/validator';
import { spawnSync } from 'child_process';
import { CLI_PACKAGE } from '../paths';
import { failure } from '../utils/format';

// url for default swagger.json openAPI type definitions from the kubernetes repo.
// current kubernetes version is v1.21.2
const BUILTIN_OPENAPI_URL = `https://raw.githubusercontent.com/kubernetes/kubernetes/v1.21.2/api/openapi-spec/swagger.json`;

export async function typeCreate(packageDir: string) {
  const desc = 'Generating types from OpenAPI spec.';
  log(format.startMarker(desc));

  const typeSource = chooseTypeSource();
  const opts = getOptsForTypeSource(typeSource);

  // Download the swagger file from the options based on type source.
  const out = await request.get(opts);
  const tmp = mkdtempSync(resolve(tmpdir(), 'kpt-init'));
  const swaggerFile = resolve(tmp, 'swagger.json');
  writeFileSync(swaggerFile, out);

  // Run typegen binary.
  const typegenOutDir = resolve(packageDir, 'src', 'gen');
  const typegen = spawnSync('typegen', [swaggerFile, typegenOutDir], {
    env: {
      PATH: `${CLI_PACKAGE.binDir}${delimiter}${process.env.PATH}`,
    },
    stdio: 'inherit',
  });
  unlinkSync(swaggerFile);
  if (typegen.status !== 0) {
    let msg = 'Failed to run typegen';
    if (typegen.error) {
      msg = `${msg}: ${typegen.error}`;
    }
    throw new Error(msg);
  }

  log(`Generated ${typegenOutDir}`);

  log(format.finishMarker(desc));
}

// chooseTypeSource lets the user choose the source for the kubernetes types and returns
// numeric choice
function chooseTypeSource(): number {
  const defaultTypeSource = 0;
  const ch = validator.getValidString(
    () =>
      question(
        `> What is the source of OpenAPI document defining the Kubernetes types? This will be used to generate Typescript library (${defaultTypeSource})
[0] Use built-in document (No cluster required)
[1] Download the document from a Kubernetes cluster
Please enter your numeric choice: `
      ),
    validator.isEmptyOrMaxInt(1),
    defaultTypeSource.toString()
  );
  log(`Using Type source choice "${ch}".\n`);

  return Number(ch);
}

// getOptsForTypeSource gets the url request options based on the numeric choice input
// refer to chooseTypeSource() for choice outcomes
function getOptsForTypeSource(typeSource: number): request.Options {
  let url = ``;
  let opts: request.Options = {
    url,
  };
  switch (typeSource) {
    case 0:
      log('Using built-in kubernetes types');
      url = BUILTIN_OPENAPI_URL;
      opts = {
        url,
      };
      return opts;

    case 1:
      // Get the kubeconfig context the user wants to use.
      const kc = new KubeConfig();
      kc.loadFromDefault();
      const contexts = kc.contexts;
      if (contexts.length == 0) {
        log(
          failure(
            'No contexts found in kubeconfig file. Please set a context entry in kubeconfig.'
          )
        );
        process.exit(1);
      }
      const currentContext = kc.currentContext;
      const contextIdx = chooseContext(contexts, currentContext);
      const useContext = contexts[contextIdx];
      const cluster = kc.clusters.find((c) => c.name === useContext.cluster);
      if (!cluster) {
        throw new Error('Cluster for specified context not found.');
      }
      kc.setCurrentContext(useContext.name);
      // set the url to cluster openAPI if cluster exists
      url = `${cluster.server}/openapi/v2`;
      opts = {
        url,
      };
      kc.applyToRequest(opts);
      return opts;

    default:
      throw new Error('Invalid choice for Kubernetes types source.');
  }
}

function chooseContext(contexts: Context[], currentContext: string): number {
  const defaultContext =
    contexts.findIndex((c) => c.name === currentContext) || 0;
  log('Contexts:\n');
  contexts.forEach((c, idx) => {
    if (c.name === currentContext) {
      // Will match no contexts if current context is not set.
      log(`${idx}) * ${c.name}`);
    } else {
      log(`${idx}) ${c.name}`);
    }
  });
  log();

  const context = validator.getValidString(
    () =>
      question(
        `> What is the kubeconfig context in which to create types (${defaultContext})? `
      ),
    validator.isEmptyOrMaxInt(contexts.length - 1),
    defaultContext.toString()
  );

  log(`Using kubeconfig context "${context}".\n`);

  return Number(context);
}
