#!/bin/bash
# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


set -euo pipefail

TAG=${TAG:-dev}
FUNCS=(gatekeeper_validate)

for f in ${FUNCS[@]}; do
    image_name=$(echo $f | sed -e 's/_/-/g')
    image=gcr.io/kpt-functions/${image_name}:${TAG}
    docker_file=/tmp/$image_name.Dockerfile
    sed "s/\$FUNC/$f/g" build/func.Dockerfile > $docker_file
    set -x
	docker build -t $image -f $docker_file .
	docker push $image
    set +x
done
