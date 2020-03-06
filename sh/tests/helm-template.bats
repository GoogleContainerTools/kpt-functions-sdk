#!/usr/bin/env ./sh/tests/libs/bats/bin/bats
load 'libs/bats-support/load'
load 'libs/bats-assert/load'

profile_script="./sh/src/helm-template"
test_chart_dir="./charts/stable/redis"

setup() {
  # Require binaries in $PATH to run helm transform script
  command -v kpt >/dev/null 2>&1 || { echo >&2 "I require kpt but it's not installed.  Aborting."; exit 1; }
  command -v helm >/dev/null 2>&1 || { echo >&2 "I require helm but it's not installed.  Aborting."; exit 1; }

  # Clone helm charts repository for example charts, fails if charts are already cloned
  git clone -q https://github.com/helm/charts.git
}

teardown() {
  rm -rf charts
}

@test "read_arguments outputs usage if too few arguments are provided" {
  run setup
  source ${profile_script}
  run read_arguments
  assert_output --partial "Render chart templates locally using helm template."
  run teardown
}

@test "read_arguments outputs usage if too many arguments are provided" {
  run setup
  source ${profile_script}
  run read_arguments chart_path=${test_chart_dir} name=my-redis extra args
  assert_output --partial "Render chart templates locally using helm template."
  run teardown
}

@test "read arguments successful if correct arguments are provided" {
  run setup
  source ${profile_script}
  run read_arguments chart_path=${test_chart_dir} name=my-redis
  assert_success
  run teardown
}

@test "read arguments successful if values path is provided" {
  run setup
  source ${profile_script}
  run read_arguments chart_path=${test_chart_dir} name=my-redis values_path=${test_chart_dir}/values-production.yaml
  assert_success
  run teardown
}

@test "helm-template successful if correct arguments are provided" {
  run setup
  source ${profile_script}
  run ${profile_script} chart_path=charts/stable/redis name=my-redis
  assert_output --partial "my-redis"
  assert_success
  run teardown
}

@test "helm-template successful if stdin and correct arguments are provided" {
  run setup
  run bash -c "${profile_script} chart_path=./charts/stable/mongodb name=my-mongodb | ${profile_script} chart_path=${test_chart_dir} name=my-redis"
  assert_output --partial "my-mongodb"
  assert_output --partial "my-redis"
  assert_success
  run teardown
}
