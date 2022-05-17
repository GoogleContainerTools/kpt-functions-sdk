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

/*
Package fn.provides an SDK for writing KRM functions in Go. The function
specification is defined at:
https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md

A KRM functions can generate, mutate or validate Kubernetes resources in a
ResourceList.

The ResourceList type and the KubeObject type are the core part of this package.
The ResourceList type maps to the ResourceList in the function spec.

The KubeObject represent a kubernetes resource in a ResourceList, and it's the basic
unit to perform most CRUD operations.

A KRM function does the following things:
  1. read yaml bytes from stdin and convert it to a ResourceList
  2. perform mutation and validation on the resources in the ResourceList
  3. write the updated ResourceList out to stdout in yaml format
  4. Any diagnostic messages should be written to stderr

In most cases, you only need to do #2 which is to use pre-defined ResourceListProcessor or use your own ResourceListProcessor
 and then pass it to AsMain. In the following example, we
use a struct which implements the fn.FunctionRunner `Run` method

```go
package main

import (
	"fmt"
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

var _ fn.FunctionRunner = &YourKRMFn{}

type YourKRMFn struct {
	Field1 map[string]string `json:",inline,omitempty"`
}

// Add your function logic in run.
// `resourcelist.functionConfig` is assigned to YourKRMFn object. Your functionConfig kind shall be `YourKRMFn` or `ConfigMap` (limited usage)
// `resourcelist.items` is the passed-in `items` parameter.
// `resourcellist.result` is empty, you can add result via `ctx` methods like `AddGeneralResult`, `AddErrResultAndDie`.
func (r *YourKRMFn) Run(ctx *fn.Context, functionConfig *fn.KubeObject, items []*fn.KubeObject) {
	for _, o := range items {
		// Your code
	}
}

func main() {
	if err := fn.AsMain(&YourKRMFn{}); err != nil {
		os.Exit(1)
	}
}
```
*/
package fn
