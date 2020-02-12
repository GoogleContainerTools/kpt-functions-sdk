#!/usr/bin/env bash

# Require binaries in $PATH to run helm transform script
which kpt
which helm

# Clone helm charts repository for example charts, fails if charts are already cloned
git clone git@github.com:helm/charts.git

# Helm transform script tests
# Works as source function
sh/src/helm_transform.sh charts/stable/redis | kpt config tree
# Works as transform function
kpt fn source ts/demo-functions/test-data/source/foo-yaml/ | sh/src/helm_transform.sh charts/stable/redis | kpt config tree
# Works if more than one argument is provided, ignores additional arguments
sh/src/helm_transform.sh charts/stable/redis lots of extra arguments | kpt config tree
# Output error message if no arguments provided
sh/src/helm_transform.sh | kpt config tree

# Build docker image
docker build -t gcr.io/kpt-functions-demo/helm-transform:test -f sh/build/helm_transform.Dockerfile sh

# Helm transform docker image tests
# Works as source function
docker run -v $(pwd):/source gcr.io/kpt-functions-demo/helm-transform:test /source/charts/stable/redis | kpt config tree
# Works as transform function
kpt fn source ts/demo-functions/test-data/source/foo-yaml/ | docker run -i -v $(pwd):/source gcr.io/kpt-functions-demo/helm-transform:test /source/charts/stable/redis | kpt config tree
