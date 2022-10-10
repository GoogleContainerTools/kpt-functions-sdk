#!/bin/bash
# Copyright 2020 The Kubernetes Authors.
# SPDX-License-Identifier: Apache-2.0

# This will read from the directory kubernetesapi
# and use subdirectory names to generate
# kubernetesapi/openapiinfo.go
#
# This script should only be run after the
# swagger.json and swagger.go files are generated.

set -e

if ! command -v jq &> /dev/null ; then
    echo Please install jq
    echo on ubuntu: sudo apt-get install jq
    exit 1
fi

info_list=()
version_list=()

V=`ls kubernetesapi | grep v.*`
for VERSION in $V
do
  openapiinfo=$(\
    jq -r '.info' kubernetesapi/$VERSION/swagger.json  | \
    sed 's/[\" *]//g' | \
    tr -d '\n' )
  info_list+=( $openapiinfo )
  version_list+=( ${VERSION} )
done


# add imports to openapiinfo.go
cat <<EOF >kubernetesapi/openapiinfo.go
// Copyright 2020 The Kubernetes Authors.
// SPDX-License-Identifier: Apache-2.0

// Code generated by $0; DO NOT EDIT.

package kubernetesapi

import (
EOF

for version in ${version_list[@]}
do
  cat <<EOF >>kubernetesapi/openapiinfo.go
  "github.com/GoogleContainerTools/kpt-functions-sdk/krmfn/internal/forked/kyaml/openapi/kubernetesapi/$version"
EOF
done

# add info string for `kustomize openapi info` command
OPEN_API_INFO=`echo ${info_list[@]} | sed 's/ /\\\n/g'`
cat <<EOF >>kubernetesapi/openapiinfo.go
)

const Info = "$OPEN_API_INFO"
EOF

# add map for `initSchema` in openapi.go to use
cat <<EOF >>kubernetesapi/openapiinfo.go

var OpenAPIMustAsset = map[string]func(string)[]byte{
EOF

latest=""
for version in ${version_list[@]}
do
  latest=$version
  cat <<EOF >>kubernetesapi/openapiinfo.go
  "$version": $version.MustAsset,
EOF
done

# add latest version to be used as a default
cat <<EOF >>kubernetesapi/openapiinfo.go
}

const DefaultOpenAPI = "$latest"
EOF


