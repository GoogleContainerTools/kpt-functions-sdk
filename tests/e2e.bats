#!/usr/bin/env bats

export EXAMPLE_CONFIGS=${BATS_TEST_DIRNAME}/../example-configs
export TAG=dev
export EMPTY_OUTPUT=$(cat <<-EOF
apiVersion: v1
kind: List
items: []
EOF
)

function setup() {
    SOURCE=$(mktemp -d -t source.XXXXXXXX)
    cp -r ${EXAMPLE_CONFIGS}/* ${SOURCE}
    cd ${SOURCE}
}

# Handles pipes properly.
function runp() {
    run bash -c "$@"
}

@test "no-op print stdout" {
    runp "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null"
    [ "$output" = "${EMPTY_OUTPUT}" ]
}

@test "no-op pipe" {
    runp "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null |
    docker run -i gcr.io/kpt-functions/no-op:${TAG}"
    [ "$output" = "${EMPTY_OUTPUT}" ]
}

@test "no-op output to /dev/null" {
   runp "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null |
   docker run -i gcr.io/kpt-functions/no-op:${TAG} |
   docker run -i gcr.io/kpt-functions/no-op:${TAG} -o /dev/null"
   [ "$output" = "" ]
}
