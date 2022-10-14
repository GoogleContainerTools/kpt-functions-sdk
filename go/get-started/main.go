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

package main

import (
	"fmt"
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// EDIT THIS FUNCTION!
// This is the main logic. rl is the input `ResourceList` which has the `FunctionConfig` and `Items` fields.
// You can modify the `Items` and add result information to `rl.Result`.
func Run(rl *fn.ResourceList) (bool, error) {
    // Your code
}

func main() {
	// CUSTOMIZE IF NEEDED
	// `AsMain` accepts a `ResourceListProcessor` interface.
	// You can explore other `ResourceListProcessor` structs in the SDK or define your own.
	if err := fn.AsMain(fn.ResourceListProcessorFunc(Run)); err != nil {
		os.Exit(1)
	}
}
