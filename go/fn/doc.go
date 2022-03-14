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

Note: this package is an fn.package.

A KRM functions can generate, mutate or validate Kubernetes resources in a
ResourceList.

The ResourceList type and the KubeObject type are the core part of this package.
The ResourceList type maps to the ResourceList in the function spec. The
KubeObject represent a kubernetes resource in a ResourceList, and it's the basic
unit to perform most CRUD operations.

A KRM function does the following things:

  1. read yaml bytes from stdin and convert it to a ResourceList
  2. perform mutation and validation on the resources in the ResourceList
  3. write the updated ResourceList out to stdout in yaml format
  4. Any diagnostic messages should be written to stderr

ResourceListProcessor

In most cases, you only need to do #2 which is implementing a
ResourceListProcessor and then pass it to AsMain. In the following example, we
use ResourceListProcessorFunc that implements the ResourceListProcessor
interface.

  func main() {
      if err := fn.AsMain(fn.ResourceListProcessorFunc(myfn)); err != nil {
          os.Exit(1)
      }
  }

  func myfn(rl *fn.ResourceList) error {
      fn.Log("log something")
      // mutate or validate the ResourceList
  }

KubeObject

KubeObject hides all the details about yaml.Node and yaml.RNode. It is always
recommended converting a KubeObject to a strong typed object or getting a field
as a strong typed object. Then do the CRUD operation on the strong typed objects.
*/
package fn
