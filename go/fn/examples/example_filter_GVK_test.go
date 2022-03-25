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

package example_test

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example implements a function that updates the replicas field for all deployments.

func Example_filterGVK() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(updateReplicas)); err != nil {
		os.Exit(1)
	}
}

// updateReplicas sets a field in resources selecting by GVK.
func updateReplicas(rl *fn.ResourceList) (bool, error) {
	if rl.FunctionConfig == nil {
		return false, fn.ErrMissingFnConfig{}
	}
	var replicas int
	rl.FunctionConfig.GetOrDie(&replicas, "replicas")
	for i, obj := range rl.Items {
		if obj.IsGVK("apps/v1", "Deployment") {
			rl.Items[i].SetOrDie(replicas, "spec", "replicas")
		}
	}
	return true, nil
}
