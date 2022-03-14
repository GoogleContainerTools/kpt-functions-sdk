package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// In this example, we read a field from the input object and print it to the log.

func Example_aReadField() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(readField)); err != nil {
		os.Exit(1)
	}
}

func readField(rl *fn.ResourceList) error {
	for _, obj := range rl.Items {
		if obj.GetAPIVersion() == "apps/v1" && obj.GetKind() == "Deployment" {
			var replicas int
			obj.GetOrDie(&replicas, "spec", "replicas")
			fn.Logf("replicas is %v\n", replicas)
		}
	}
	return nil
}
