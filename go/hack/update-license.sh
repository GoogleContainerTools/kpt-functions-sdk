#!/usr/bin/env bash

# Copyright 2022 Google LLC
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

# don't add licenses to the site directory, it will break the docs
# and will add them to the theme which is a submodule (bad)
command -v addlicense || go run github.com/google/addlicense@v1.0.0
# - `addlicense` skips the .yaml files (specifically for golden test _expected.yaml) to avoid the conflict where
# the `addlicense` adds unexpected license header that fails the golden tests diff-comparison in _expected.yaml.
# - the [0-9a-z] is a trick to avoid using `**/**/*.yaml` directly which hits the shellcheck SC2035. SC2035 only accepts
# ./*glob* or -- *glob* which can't be recoganized by addlicese.
# See https://www.shellcheck.net/wiki/SC2035
find . -print0 | xargs "$GOBIN"/addlicense -y 2022 -l apache -ignore [0-9a-z]**/**/_expected.yaml

