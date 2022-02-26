#!/bin/bash

set -euo pipefail

declare -A imagearray=()
imagearray["gcr.io/kpt-functions/read-yaml"]="gcr.io/config-management-release/read-yaml"
imagearray["gcr.io/kpt-functions/write-yaml"]="gcr.io/config-management-release/write-yaml"
imagearray["gcr.io/kpt-functions/gatekeeper-validate"]="gcr.io/kpt-functions/gatekeeper-validate"
imagearray["gcr.io/kpt-functions/gatekeeper-validate"]="gcr.io/config-management-release/policy-controller-validate"
imagearray["gcr.io/kpt-dev/kpt"]="gcr.io/config-management-release/kpt"
imagearray["gcr.io/kpt-functions/helm-template"]="gcr.io/kpt-functions/helm-template"
imagearray["gcr.io/kpt-functions/helm-template"]="gcr.io/config-management-release/helm-template"
imagearray["gcr.io/kpt-functions/kubeval"]="gcr.io/kpt-functions/kubeval"
imagearray["gcr.io/kpt-functions/kubeval"]="gcr.io/config-management-release/kubeval"
imagearray["gcr.io/kpt-functions/istioctl-analyze"]="gcr.io/kpt-functions/istioctl-analyze"
imagearray["gcr.io/kpt-functions/istioctl-analyze"]="gcr.io/config-management-release/istioctl-analyze"

for image in "${!imagearray[@]}"; do
  docker pull ${image}
  docker tag ${image} ${imagearray[$image]}:latest
  docker tag ${image} ${imagearray[$image]}:stable
  docker push ${imagearray[$image]}:latest
  docker push ${imagearray[$image]}:stable
done
