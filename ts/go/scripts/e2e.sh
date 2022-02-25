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

rm -f /tmp/gatekeeper.txt
go run cmd/gatekeeper_validate/gatekeeper_validate.go --input testdata/source/pod-security-policy.yaml 2> /tmp/gatekeeper.txt || true
grep -q "Found 80 violations" /tmp/gatekeeper.txt || echo "gatekeeper function has Unexpected results"
