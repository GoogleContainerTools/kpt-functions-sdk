#!/usr/bin/env bash
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


set -euo pipefail

PKG=init-package

# Fail if kind cluster generate-init-pkg already exists.
if kind get clusters | grep -w "generate-init-pkg"
then
  echo "Kind cluster generate-init-pkg already exists."
  echo "Delete the cluster with:"
  echo "kind delete cluster --name=generate-init-pkg"
else
    # Use images from https://hub.docker.com/r/kindest/node/tags
    kind create cluster --name=generate-init-pkg --config=scripts/kind-config.yaml --image=kindest/node:v1.14.6@sha256:464a43f5cf6ad442f100b0ca881a3acae37af069d5f96849c1d06ced2870888d
    sleep 10 # Wait for cluster to become fully available. Potentially flaky.
fi

cd ts
rm -rf $PKG
mkdir $PKG
cd $PKG
npm init kpt-functions

