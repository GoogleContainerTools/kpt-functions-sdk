#!/usr/bin/env bash

currDir="$(pwd)"
tempDir="$(mktemp -d)"

if [[ $# -eq 0 ]] ; then
    1>&2 echo "First argument required: relative path to helm chart"
    exit 1
else 
    # Get chart path as first argument
    chartPath="$1"
fi

if [ ! -t 0 ]; then
    stdin="-"
    cat ${stdin} | kpt fn sink ${tempDir}
fi

# Overwrite files if they exist
# TODO: Integrate kpt merge behavior
helmOutput="$(helm template ${currDir}/${chartPath} --output-dir ${tempDir})"

kpt fn source ${tempDir}

rm -rf ${tempDir}
