#!/usr/bin/env bash

set -euo pipefail

# Declare source image project id
declare projectid=$1
shift

# Declare and populate array of source and destination image names
declare -A imagearray=()
for arg; do
  eval `echo "imagearray$arg"`
done

for image in ${!imagearray[@]}; do
  docker pull gcr.io/${projectid}/${image}:latest
  docker tag gcr.io/${projectid}/${image}:latest gcr.io/config-management-release/${imagearray[$image]}:latest
  docker tag gcr.io/${projectid}/${image}:latest gcr.io/config-management-release/${imagearray[$image]}:stable
  docker push gcr.io/config-management-release/${imagearray[$image]}:latest
  docker push gcr.io/config-management-release/${imagearray[$image]}:stable
done
