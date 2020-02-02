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

DIST=$(pwd)/../ts/demo-functions/dist
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
    assert "node ${DIST}/no_op_run.js -i /dev/null > out"
    assert_equals "$(<out)" "${EMPTY_OUTPUT}"
}

function test_noop_pipe() {
    assert "node ${DIST}/no_op_run.js -i /dev/null |
    node ${DIST}/no_op_run.js > out"
    assert_equals "$(<out)" "${EMPTY_OUTPUT}"
}

function test_noop_devnull() {
    assert "node ${DIST}/no_op_run.js -i /dev/null |
    node ${DIST}/no_op_run.js |
    node ${DIST}/no_op_run.js -o /dev/null > out"
    assert_equals "$(<out)" ""
}

function test_demo_funcs() {
    assert "node ${DIST}/read_yaml_run.js -i /dev/null -d source_dir=$(pwd) |
        node ${DIST}/mutate_psp_run.js |
        node ${DIST}/expand_team_cr_run.js |
        node ${DIST}/validate_rolebinding_run.js -d subject_name=alice@foo-corp.com |
        node ${DIST}/write_yaml_run.js -o /dev/null -d sink_dir=$(pwd) -d overwrite=true"

    # Check expected diff
    assert "ls payments-dev payments-prod"
    assert "grep allowPrivilegeEscalation podsecuritypolicy_psp.yaml"
}
