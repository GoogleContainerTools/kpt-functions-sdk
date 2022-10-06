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

package fn

type Runner interface {
	// Run passes the `functionConfig` and `items` from input ResourceList to allow you to do operations.
	// Args:
	//    items: We intentionally do not allow you to add or delete KubeObject from "items", you can only modify
	// the items, because we expect you to use Runner only for transformer or validator functions.
	//    results: You can use `ErrorE` `Errorf` `Infof` `Warningf` `WarningE` to add user message to `Results`.
	// Returns:
	//    return a boolean to tell whether the execution should be considered as PASS or FAIL. CLI like kpt will
	// display the corresponding message.
	Run(context *Context, functionConfig *KubeObject, items KubeObjects, results *Results) bool
}
