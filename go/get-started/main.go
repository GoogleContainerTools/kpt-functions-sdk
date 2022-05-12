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
