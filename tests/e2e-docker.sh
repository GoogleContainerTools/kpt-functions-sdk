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

TAG=${TAG:-dev}
EMPTY_OUTPUT=$(
    cat <<-EOF
apiVersion: v1
kind: List
items: []
EOF
)

function setup() {
    tmp=$(mktemp -d /tmp/e2e.XXXXXXXX)
    cp -r ../example-configs/* "${tmp}"
    cd "${tmp}"
}

function test_noop_print() {
    assert "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null > out"
    assert_equals "$(<out)" "${EMPTY_OUTPUT}"
}

function test_noop_pipe() {
    assert "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null |
        docker run -i gcr.io/kpt-functions/no-op:${TAG} > out"
    assert_equals "$(<out)" "${EMPTY_OUTPUT}"
}

function test_noop_devnull() {
    assert "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null |
        docker run -i gcr.io/kpt-functions/no-op:${TAG} |
        docker run -i gcr.io/kpt-functions/no-op:${TAG} -o /dev/null > out"
    assert_equals "$(<out)" ""
}

function test_demo_funcs() {
    assert "docker run -i -u $(id -u) -v $(pwd):/source gcr.io/kpt-functions/read-yaml:${TAG} -i /dev/null -d source_dir=/source |
        docker run -i gcr.io/kpt-functions/mutate-psp:${TAG} |
        docker run -i gcr.io/kpt-functions/expand-team-cr:${TAG} |
        docker run -i gcr.io/kpt-functions/validate-rolebinding:${TAG} -d subject_name=alice@foo-corp.com |
        docker run -i -u $(id -u) -v $(pwd):/sink gcr.io/kpt-functions/write-yaml:${TAG} -o /dev/null -d sink_dir=/sink -d overwrite=true"

    # Check expected diff
    assert "ls payments-dev payments-prod"
    assert "grep allowPrivilegeEscalation podsecuritypolicy_psp.yaml"
}
