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
		if obj.APIVersion() == "apps/v1" && obj.Kind() == "Deployment" {
			replicas := 10
			obj.SetOrDie(&replicas, "spec", "replicas")
		}
	}
	return nil
}
