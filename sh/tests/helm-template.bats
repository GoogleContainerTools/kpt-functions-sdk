#!/usr/bin/env ./sh/tests/libs/bats/bin/bats
load 'libs/bats-support/load'
load 'libs/bats-assert/load'

profile_script="./sh/src/helm-template"

setup() {
  # Require binaries in $PATH to run helm transform script
  command -v kpt >/dev/null 2>&1 || { echo >&2 "I require kpt but it's not installed.  Aborting."; exit 1; }
  command -v helm >/dev/null 2>&1 || { echo >&2 "I require helm but it's not installed.  Aborting."; exit 1; }

  # Clone helm charts repository for example charts, fails if charts are already cloned
  git clone git@github.com:helm/charts.git
}

teardown() {
  rm -rf charts
}

@test "read_arguments outputs error message if no arguments are provided" {
  run setup
  source ${profile_script}
  run read_arguments
  assert_output --partial "Missing 'data.chart_path' in ConfigMap provided as functionConfig"
  run teardown
}

@test "read_arguments outputs usage if more than one argument is provided" {
  run setup
  source ${profile_script}
  run read_arguments chart_path=./charts/stable/redis lots of extra arguments
  assert_output --partial "Render chart templates locally using helm template."
  run teardown
}

@test "read arguments successful if chart_path argument is provided" {
  run setup
  source ${profile_script}
  run read_arguments chart_path=./charts/stable/redis
  assert_success
  run teardown
}

@test "helm-template successful if chart_path argument is provided" {
  run setup
  source ${profile_script}
  run ${profile_script} chart_path=charts/stable/redis
  assert_output --partial "redis"
  assert_success
  run teardown
}

@test "helm-template successful if stdin and chart_path argument are provided" {
  run setup
  run bash -c "${profile_script} chart_path=charts/stable/mongodb | ${profile_script} chart_path=charts/stable/redis"
  assert_output --partial "mongodb"
  assert_output --partial "redis"
  assert_success
  run teardown
}
