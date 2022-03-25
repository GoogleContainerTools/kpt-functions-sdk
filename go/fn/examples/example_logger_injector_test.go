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

	corev1 "k8s.io/api/core/v1"
	yaml2 "sigs.k8s.io/kustomize/kyaml/yaml"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// In this example, we implement a function that injects a logger as a sidecar
// container in workload APIs.

func Example_loggeInjector() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(injectLogger)); err != nil {
		os.Exit(1)
	}
}

// injectLogger injects a logger container into the workload API resources.
// generate implements the gokrmfn.KRMFunction interface.
func injectLogger(rl *fn.ResourceList) (bool, error) {
	var li LoggerInjection
	if err := rl.FunctionConfig.As(&li); err != nil {
		return false, err
	}
	for i, obj := range rl.Items {
		if obj.GetAPIVersion() == "apps/v1" && (obj.GetKind() == "Deployment" || obj.GetKind() == "StatefulSet" || obj.GetKind() == "DaemonSet" || obj.GetKind() == "ReplicaSet") {
			var containers []corev1.Container
			obj.GetOrDie(&containers, "spec", "template", "spec", "containers")
			foundTargetContainer := false
			for j, container := range containers {
				if container.Name == li.ContainerName {
					containers[j].Image = li.ImageName
					foundTargetContainer = true
					break
				}
			}
			if !foundTargetContainer {
				c := corev1.Container{
					Name:  li.ContainerName,
					Image: li.ImageName,
				}
				containers = append(containers, c)
			}
			rl.Items[i].SetOrDie(containers, "spec", "template", "spec", "containers")
		}
	}
	return true, nil
}

// LoggerInjection is type definition of the functionConfig.
type LoggerInjection struct {
	yaml2.ResourceMeta `json:",inline" yaml:",inline"`

	ContainerName string `json:"containerName" yaml:"containerName"`
	ImageName     string `json:"imageName" yaml:"imageName"`
}
