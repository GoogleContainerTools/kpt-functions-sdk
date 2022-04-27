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
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
	corev1 "k8s.io/api/core/v1"
	yaml2 "sigs.k8s.io/kustomize/kyaml/yaml"
)

var (
	deployment fn.KubeObject
	configMap  fn.KubeObject
)

func ExampleKubeObject_mutatePrimitiveField() {
	replicas, found, err := deployment.NestedInt64("spec", "replicas")
	if err != nil { /* do something */
	}
	if !found { /* do something */
	}

	// mutate the replicas variable

	err = deployment.SetNestedField(&replicas, "spec", "replicas")
	if err != nil { /* do something */
	}
}

func ExampleKubeObject_mutatePrimitiveSlice() {
	var finalizers []string
	found, err := deployment.Get(&finalizers, "metadata", "finalizers")
	if err != nil { /* do something */
	}
	if !found { /* do something */
	}

	// mutate the finalizers slice

	err = deployment.SetNestedField(finalizers, "metadata", "finalizers")
	if err != nil { /* do something */
	}
}

func ExampleKubeObject_mutatePrimitiveMap() {
	var data map[string]string
	found, err := configMap.Get(&data, "data")
	if err != nil { /* do something */
	}
	if !found { /* do something */
	}

	// mutate the data map

	err = deployment.SetNestedField(data, "data")
	if err != nil { /* do something */
	}
}

func ExampleKubeObject_mutateStrongTypedField() {
	var podTemplate corev1.PodTemplate
	found, err := configMap.Get(&podTemplate, "spec", "template")
	if err != nil { /* do something */
	}
	if !found { /* do something */
	}

	// mutate the podTemplate object

	err = deployment.SetNestedField(podTemplate, "spec", "template")
	if err != nil { /* do something */
	}
}

func ExampleKubeObject_mutateStrongTypedSlice() {
	var containers []corev1.Container
	found, err := deployment.Get(&containers, "spec", "template", "spec", "containers")
	if err != nil { /* do something */
	}
	if !found { /* do something */
	}

	// mutate the podTemplate object

	err = deployment.SetNestedField(containers, "spec", "template", "spec", "containers")
	if err != nil { /* do something */
	}
}

func ExampleKubeObject_mutateRNode() {
	var rnode yaml2.RNode
	// Get a field as RNode. This may be useful if you want to deal with low-level
	// yaml manipulation (e.g. dealing with comments).
	found, err := deployment.Get(&rnode, "metadata", "namespace")
	if err != nil { /* do something */
	}
	if !found { /* do something */
	}

	// Any modification done on the rnode will be reflected on the original object.
	// No need to invoke Set method when using RNode
	ynode := rnode.YNode()
	ynode.HeadComment = ynode.LineComment
	ynode.LineComment = ""
}
