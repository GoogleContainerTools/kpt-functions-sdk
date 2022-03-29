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

// In this example, we read a field from the input object and print it to the log.

func Example_cSetField() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(setField)); err != nil {
		os.Exit(1)
	}
}

func setField(rl *fn.ResourceList) error {
	for _, obj := range rl.Items {
		switch{
		case obj.IsGVK("apps/v1", "Deployment"):
			replicas := 10
			obj.SetOrDie(&replicas, "spec", "replicas")
		case obj.IsGVK("rbac.authorization.k8s.io/v1", "ClusterRoleBinding"):
			namespace := "test"
			obj.SetOrDie(&namespace, "subjects", "kind=ServiceAccount", "namespace")
		}
	}
	return nil
}
