#!/usr/bin/env bats

export TAG=${TAG:-dev}
export EXAMPLE_CONFIGS=${BATS_TEST_DIRNAME}/../example-configs
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
    [ "$status" -eq 0 ]
    [ "$output" = "${EMPTY_OUTPUT}" ]
}

@test "no-op pipe" {
    runp "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null |
    docker run -i gcr.io/kpt-functions/no-op:${TAG}"
    [ "$status" -eq 0 ]
    [ "$output" = "${EMPTY_OUTPUT}" ]
}

@test "no-op output to /dev/null" {
    runp "docker run -i gcr.io/kpt-functions/no-op:${TAG} -i /dev/null |
    docker run -i gcr.io/kpt-functions/no-op:${TAG} |
    docker run -i gcr.io/kpt-functions/no-op:${TAG} -o /dev/null"
    [ "$status" -eq 0 ]
    [ "$output" = "" ]
}

@test "all demo functions" {
    runp "docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml:${TAG} -i /dev/null -d source_dir=/source |
    docker run -i gcr.io/kpt-functions/mutate-psp:${TAG} |
    docker run -i gcr.io/kpt-functions/expand-team-cr:${TAG} |
    docker run -i gcr.io/kpt-functions/validate-rolebinding:${TAG} -d subject_name=alice@foo-corp.com |
    docker run -i -u $(id -u) -v $(pwd):/sink gcr.io/kpt-functions/write-yaml:${TAG} -o /dev/null -d sink_dir=/sink -d overwrite=true"
    [ "$status" -eq 0 ]
    [ "$output" = "" ]

    # Check expected diff
    ls payments-dev payments-prod
    grep allowPrivilegeEscalation podsecuritypolicy_psp.yaml
}
