#!/usr/bin/env ./sh/tests/libs/bats/bin/bats
load 'libs/bats-support/load'
load 'libs/bats-assert/load'

profile_script="sh/build/helm-template.Dockerfile"
docker_image="gcr.io/kpt-functions-demo/helm-template:test"
curr_dir=$(pwd)
test_chart_dir=${curr_dir}/charts/stable/redis

setup() {
  # Clone helm charts repository for example charts, fails if charts are already cloned
  git clone -q https://github.com/helm/charts.git
  docker build -t ${docker_image} -f ${profile_script} sh
}

teardown() {
  rm -rf charts
}

@test "helm-template docker image outputs error message if no arguments are provided" {
  run setup
  run docker run -v ${test_chart_dir}:/source ${docker_image}
  assert_output --partial "Missing 'data.chart_path' in ConfigMap provided as functionConfig"
  run teardown
}

@test "helm-template docker image outputs usage if more than one argument is provided" {
  run setup
  run docker run -v ${test_chart_dir}:/source ${docker_image} chart_path=/source lots of extra arguments
  assert_output --partial "Render chart templates locally using helm template."
  run teardown
}

@test "helm-template docker image successful if chart_path argument is provided" {
  run setup
  run docker run -v ${test_chart_dir}:/source ${docker_image} chart_path=/source
  assert_output --partial "redis"
  assert_success
  run teardown
}

@test "helm-template docker image successful if stdin and chart_path argument are provided" {
  run setup
  run bash -c "docker run -v ${curr_dir}/charts/stable/mongodb:/source ${docker_image} chart_path=/source | docker run -i -v ${test_chart_dir}:/source ${docker_image} chart_path=/source"
  assert_output --partial "mongodb"
  assert_output --partial "redis"
  assert_success
  run teardown
}
