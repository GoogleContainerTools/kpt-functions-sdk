// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"github.com/GoogleContainerTools/kpt-functions-sdk/ts/go/pkg/framework/runners"
	"github.com/GoogleContainerTools/kpt-functions-sdk/ts/go/pkg/functions/gatekeeper"
)

const usage = `
Evaluates OPA constraints against input configuration objects.

Constraints themselves are also declared as part of the input.
`

func main() {
	runners.RunFunc(gatekeeper.Validate, usage)
}
