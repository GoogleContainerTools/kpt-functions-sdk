package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn"
)

// In this example, we read a field from the input object and print it to the log.

func Example_cSetField() {
	if err := krmfn.AsMain(krmfn.ResourceListProcessorFunc(setField)); err != nil {
		os.Exit(1)
	}
}

func setField(rl *krmfn.ResourceList) error {
	for _, obj := range rl.Items {
		if obj.APIVersion() == "apps/v1" && obj.Kind() == "Deployment" {
			replicas := 10
			obj.SetOrDie(&replicas, "spec", "replicas")
		}
	}
	return nil
}
