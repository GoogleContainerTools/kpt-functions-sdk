#!/bin/bash
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

. demo-magic/demo-magic.sh

EXAMPLE_CONFIGS="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"/../../example-configs
PROMPT_TIMEOUT=3
TAG=demo
NO_WAIT=true
# Disable interative "less" behavior for e.g. git diff
export GIT_PAGER=

cd $(mktemp -d)
git init

stty rows 80 cols 15

export PKG=git@github.com:GoogleContainerTools/kpt-functions-sdk.git/example-configs

# start demo
clear

p "# Fetch example configs"
p "kpt pkg get ${PKG} example-configs"
cp -r ${EXAMPLE_CONFIGS} .
pe "git add . && git commit -m 'fetched example-configs'"

clear

p "# Generate configs"
pe "kpt functions source . |
  docker run -i gcr.io/kpt-functions/expand-team-cr |
  kpt functions sink ."
pe "git status -u"
wait

git clean -fd
clear

p "# Mutate configs"
pe "kpt functions source . |
  docker run -i gcr.io/kpt-functions/mutate-psp |
  kpt functions sink ."
pe "git diff"
wait

git reset HEAD --hard
clear

p "# Enforce compliance"
pe "kpt functions source . |
  docker run -i gcr.io/kpt-functions/validate-rolebinding -d subject_name=bob@foo-corp.com"
wait

clear

p "# Compose a pipeline of functions"
pe "kpt functions source . |
  docker run -i gcr.io/kpt-functions/expand-team-cr |
  docker run -i gcr.io/kpt-functions/mutate-psp |
  docker run -i gcr.io/kpt-functions/validate-rolebinding -d subject_name=alice@foo-corp.com |
  kpt functions sink ."
