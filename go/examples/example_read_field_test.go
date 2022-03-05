package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn"
)

// In this example, we read a field from the input object and print it to the log.

func Example_aReadField() {
	if err := krmfn.AsMain(krmfn.ResourceListProcessorFunc(readField)); err != nil {
		os.Exit(1)
	}
}

func readField(rl *krmfn.ResourceList) error {
	for _, obj := range rl.Items {
		if obj.APIVersion() == "apps/v1" && obj.Kind() == "Deployment" {
			var replicas int
			obj.GetOrDie(&replicas, "spec", "replicas")
			krmfn.Logf("replicas is %v\n", replicas)
		}
	}
	return nil
}
