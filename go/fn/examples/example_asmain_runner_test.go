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

var _ fn.Runner = &CustomFnConfig{}

type CustomFnConfig struct {
	Owner string
	Org   string
}

// Run is the main function logic.
// `ctx` provides easy methods to add info, error or warning result to `ResourceList.Results`.
// `items` is parsed from the STDIN "ResourceList.Items".
// `functionConfig` is from the STDIN "ResourceList.FunctionConfig". The value is parsed from a `CustomFnConfig` type
// "owner" and "org" field.
func (r *CustomFnConfig) Run(ctx *fn.Context, functionConfig *fn.KubeObject, items fn.KubeObjects) {
	for _, o := range items {
		o.SetName(r.Owner)
		o.SetNamespace(r.Org)
	}
	ctx.ResultInfo("updated namespace and name", nil)
}

// This example uses a CustomFnConfig object, which implements `Runner.Run` methods.
func Example_asMainCustomFnConfig() {
	file, _ := os.Open("./data/runner-customFnConfig.yaml")
	defer file.Close()
	os.Stdin = file

	if err := fn.AsMain(&CustomFnConfig{}); err != nil {
		os.Exit(1)
	}
	// Output:
	// apiVersion: config.kubernetes.io/v1
	// kind: ResourceList
	// items:
	// - apiVersion: v1
	//   kind: Service
	//   metadata:
	//     name: kpt
	//     namespace: google
	// functionConfig:
	//   apiVersion: fn.kpt.dev/v1alpha1
	//   kind: CustomFnConfig
	//   metadata:
	//     name: runner-fn-config
	//   owner: kpt
	//   org: google
	// results:
	// - message: updated namespace and name
	//   severity: info
}

func Example_asMainConfigMap() {
	file, _ := os.Open("./data/runner-configmap.yaml")
	defer file.Close()
	os.Stdin = file

	if err := fn.AsMain(&CustomFnConfig{}); err != nil {
		os.Exit(1)
	}
	// Output:
	// apiVersion: config.kubernetes.io/v1
	// kind: ResourceList
	// items:
	// - apiVersion: v1
	//   kind: Service
	//   metadata:
	//     name: kpt
	//     namespace: google
	// functionConfig:
	//   apiVersion: v1
	//   kind: ConfigMap
	//   metadata:
	//     name: customConfig
	//   data:
	//     owner: kpt
	//     org: google
	// results:
	// - message: updated namespace and name
	//   severity: info
}

var _ fn.Runner = &SetLabels{}

type SetLabels struct {
	Data map[string]string
}

// Run is the main function logic.
// `ctx` provides easy methods to add info, error or warning result to `ResourceList.Results`.
// `items` is parsed from the STDIN "ResourceList.Items".
// `functionConfig` is from the STDIN "ResourceList.FunctionConfig". The value is parsed from a `ConfigMap` type
// "data" field.
func (r *SetLabels) Run(ctx *fn.Context, functionConfig *fn.KubeObject, items fn.KubeObjects) {
	for _, o := range items {
		for k, v := range r.Data {
			o.SetLabel(k, v)
		}
	}
	ctx.ResultInfo("updated labels", nil)
}

func Example_asMain_configMapData() {
	file, _ := os.Open("./data/runner-configmap-general.yaml")
	defer file.Close()
	os.Stdin = file

	if err := fn.AsMain(&SetLabels{}); err != nil {
		os.Exit(1)
	}
	// Output:
	// apiVersion: config.kubernetes.io/v1
	// kind: ResourceList
	// items:
	// - apiVersion: v1
	//   kind: Service
	//   metadata:
	//     name: example
	//     labels:
	//       project-id: kpt-dev
	//       managed-by: kpt
	// functionConfig:
	//   apiVersion: v1
	//   kind: ConfigMap
	//   metadata:
	//     name: runner-fn-config
	//   data:
	//     project-id: kpt-dev
	//     managed-by: kpt
	// results:
	// - message: updated labels
	//   severity: info
}
