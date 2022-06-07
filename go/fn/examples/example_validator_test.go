// Copyright 2022 Google LLC
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

package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example implements a function that validate resources to ensure
// spec.template.spec.securityContext.runAsNonRoot is set in workload APIs.
func Example_validator() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(validator)); err != nil {
		os.Exit(1)
	}
}

func validator(rl *fn.ResourceList) (bool, error) {
	var results fn.Results
	for _, obj := range rl.Items.Where(hasDesiredGVK) {
		var runAsNonRoot bool
		obj.GetOrDie(&runAsNonRoot, "spec", "template", "spec", "securityContext", "runAsNonRoot")
		if !runAsNonRoot {
			results = append(results, fn.ConfigObjectResult("`spec.template.spec.securityContext.runAsNonRoot` must be set to true", obj, fn.Error))
		}
	}
	return true, results
}
