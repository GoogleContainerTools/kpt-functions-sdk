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

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. >/dev/null 2>&1 && pwd)"
DIST=${REPO}/ts/demo-functions/dist
TAG=${TAG:-dev}
NODOCKER=${NODOCKER:-}
EMPTY_OUTPUT=$(
  cat <<-EOF
apiVersion: v1
kind: ResourceList
metadata:
  name: output
items: []
EOF
)

############################
# Test framework
############################

function testcase() {
  echo "testcase: ${1}"
  tmp=$(mktemp -d "/tmp/e2e.${1}.XXXXXXXX")
  cp -r "${REPO}"/example-configs/* "${tmp}"
  cd "${tmp}"
}

function fail() {
  echo "FAIL: " "$@"
  exit 1
}

function assert_empty_list() {
  content="$(<"$1")"
  [[ ${content} = "${EMPTY_OUTPUT}" ]] || fail "Not empty list: ${content}"
}

function assert_empty_string() {
  content="$(<"$1")"
  [[ -z ${content} ]] || fail "Not empty list: ${content}"
}

function assert_dir_exists() {
  [[ -d $1 ]] || fail "Dir not exist: $1"
}

############################
# Node Tests
############################

testcase "node_no_op_stdout"
node "${DIST}"/no_op_run.js -i /dev/null >out.yaml
assert_empty_list out.yaml

testcase "node_no_op_regular_files"
echo "$EMPTY_OUTPUT" >in.yaml
node "${DIST}"/no_op_run.js -i in.yaml -o out.yaml
assert_empty_list out.yaml

testcase "node_no_op_pipe"
node "${DIST}"/no_op_run.js -i /dev/null |
  node "${DIST}"/no_op_run.js >out.yaml
assert_empty_list out.yaml

testcase "node_no_op_devnull"
node "${DIST}"/no_op_run.js -i /dev/null |
  node "${DIST}"/no_op_run.js |
  node "${DIST}"/no_op_run.js -o /dev/null >out.yaml
assert_empty_string out.yaml

testcase "node_label_namespace"
node "${DIST}"/read_yaml_run.js -i /dev/null -d source_dir="$(pwd)" |
  node "${DIST}"/label_namespace_run.js -d label_name=color -d label_value=orange |
  grep -q 'color: orange'

testcase "kpt_node_label_namespace"
kpt fn source . |
  node "${DIST}"/label_namespace_run.js -d label_name=color -d label_value=orange |
  kpt fn sink .
grep -qR 'color: orange' .

testcase "node_label_namespace_func_config_file"
cat >fc.yaml <<EOF
apiVersion: v1
kind: ConfigMap
data:
  label_name: color
  label_value: orange
metadata:
  name: my-config
EOF
node "${DIST}"/read_yaml_run.js -i /dev/null -d source_dir="$(pwd)" |
  node "${DIST}"/label_namespace_run.js -f fc.yaml |
  grep -q 'color: orange'

testcase "node_demo_funcs"
node "${DIST}"/read_yaml_run.js -i /dev/null -d source_dir="$(pwd)" |
  node "${DIST}"/mutate_psp_run.js |
  node "${DIST}"/expand_team_cr_run.js |
  node "${DIST}"/validate_rolebinding_run.js -d subject_name=alice@foo-corp.com |
  node "${DIST}"/write_yaml_run.js -o /dev/null -d sink_dir="$(pwd)" -d overwrite=true
assert_dir_exists payments-dev
assert_dir_exists payments-prod
grep -q allowPrivilegeEscalation podsecuritypolicy_psp.yaml

############################
# Docker Tests
############################

[[ -z ${NODOCKER} ]] || {
  echo "Skipping docker tests"
  exit 0
}

testcase "docker_no_op_stdout"
docker run -i gcr.io/kpt-functions/no-op:"${TAG}" -i /dev/null >out.yaml
assert_empty_list out.yaml

testcase "docker_no_op_regular_files"
echo "$EMPTY_OUTPUT" >in.yaml
docker run -i -u "$(id -u)" -v "$(pwd)":/source gcr.io/kpt-functions/no-op:"${TAG}" -i /source/in.yaml -o /source/out.yaml
assert_empty_list out.yaml

testcase "docker_no_op_pipe"
docker run -i gcr.io/kpt-functions/no-op:"${TAG}" -i /dev/null |
  docker run -i gcr.io/kpt-functions/no-op:"${TAG}" >out.yaml
assert_empty_list out.yaml

testcase "docker_no_op_devnull"
docker run -i gcr.io/kpt-functions/no-op:"${TAG}" -i /dev/null |
  docker run -i gcr.io/kpt-functions/no-op:"${TAG}" |
  docker run -i gcr.io/kpt-functions/no-op:"${TAG}" -o /dev/null >out.yaml
assert_empty_string out.yaml

testcase "docker_label_namespace"
docker run -i -u "$(id -u)" -v "$(pwd)":/source gcr.io/kpt-functions/read-yaml:"${TAG}" -i /dev/null -d source_dir=/source |
  docker run -i gcr.io/kpt-functions/label-namespace:"${TAG}" -d label_name=color -d label_value=orange |
  grep -q 'color: orange'

testcase "docker_demo_funcs"
docker run -i -u "$(id -u)" -v "$(pwd)":/source gcr.io/kpt-functions/read-yaml:"${TAG}" -i /dev/null -d source_dir=/source |
  docker run -i gcr.io/kpt-functions/mutate-psp:"${TAG}" |
  docker run -i gcr.io/kpt-functions/expand-team-cr:"${TAG}" |
  docker run -i gcr.io/kpt-functions/validate-rolebinding:"${TAG}" -d subject_name=alice@foo-corp.com |
  docker run -i -u "$(id -u)" -v "$(pwd)":/sink gcr.io/kpt-functions/write-yaml:"${TAG}" -o /dev/null -d sink_dir=/sink -d overwrite=true
assert_dir_exists payments-dev
assert_dir_exists payments-prod
grep -q allowPrivilegeEscalation podsecuritypolicy_psp.yaml

############################
# kpt fn Tests
############################

testcase "kpt_label_namespace_imperative"
kpt fn source . |
  kpt fn run --image gcr.io/kpt-functions/label-namespace:"${TAG}" -- label_name=color label_value=orange |
  kpt fn sink .
grep -qR 'color: orange' .

testcase "kpt_label_namespace_imperative_short"
kpt fn run --image gcr.io/kpt-functions/label-namespace:"${TAG}" . -- label_name=color label_value=orange
grep -qR 'color: orange' .

testcase "kpt_label_namespace_declarative"
cat <<EOF >kpt-func.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  annotations:
    config.k8s.io/function: |
      container:
        image:  gcr.io/kpt-functions/label-namespace:${TAG}
    config.kubernetes.io/local-config: "true"
data:
  label_name: color
  label_value: orange
EOF
kpt fn run .
grep -qR 'color: orange' .

testcase "kpt_label_namespace_declarative_multi"
cat <<EOF >kpt-func.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  annotations:
    config.k8s.io/function: |
      container:
        image:  gcr.io/kpt-functions/label-namespace:${TAG}
    config.kubernetes.io/local-config: "true"
data:
  label_name: color
  label_value: orange
EOF
cat <<EOF >kpt-func2.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config2
  annotations:
    config.k8s.io/function: |
      container:
        image:  gcr.io/kpt-functions/label-namespace:${TAG}
    config.kubernetes.io/local-config: "true"
data:
  label_name: city
  label_value: toronto
EOF
kpt fn run .
grep -qR 'color: orange' .
grep -qR 'city: toronto' .
