#!/usr/bin/env ./sh/tests/libs/bats/bin/bats
load 'libs/bats-support/load'
load 'libs/bats-assert/load'

docker_image="gcr.io/kpt-functions-demo/helm-template:test"
curr_dir=$(pwd)
test_chart_dir=${curr_dir}/charts/stable/redis

setup() {
  # Clone helm charts repository for example charts, fails if charts are already cloned
  git clone -q https://github.com/helm/charts.git
  docker build -t ${docker_image} -f "sh/build/helm-template.Dockerfile" sh
}

teardown() {
  rm -rf charts
}

@test "helm-template docker image outputs usage if too few arguments are provided" {
  run setup
  run docker run -v ${test_chart_dir}:/source ${docker_image}
  assert_output --partial "Render chart templates locally using helm template."
  run teardown
}

@test "helm-template docker image outputs usage if too many arguments are provided" {
  run setup
  run docker run -v ${test_chart_dir}:/source ${docker_image} chart_path=/source name=my-redis extra args
  assert_output --partial "Render chart templates locally using helm template."
  run teardown
}

@test "helm-template docker image successful if correct arguments are provided" {
  run setup
  run docker run -v ${test_chart_dir}:/source ${docker_image} chart_path=/source name=my-redis
  assert_output --partial "my-redis"
  assert_success
  run teardown
}

@test "helm-template docker image successful if stdin and correct arguments are provided" {
  run setup
  run bash -c "docker run -v ${curr_dir}/charts/stable/mongodb:/source ${docker_image} chart_path=/source name=my-mongodb |
    docker run -i -v ${test_chart_dir}:/source ${docker_image} chart_path=/source name=my-redis"
  assert_output --partial "my-mongodb"
  assert_output --partial "my-redis"
  assert_success
  run teardown
}
