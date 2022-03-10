package example_test

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example implements a function that updates the replicas field for all deployments.

func Example_filterGVK() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(updateReplicas)); err != nil {
		os.Exit(1)
	}
}

// updateReplicas sets a field in resources selecting by GVK.
func updateReplicas(rl *fn.ResourceList) error {
	if rl.FunctionConfig == nil {
		return fn.ErrMissingFnConfig{}
	}
	var replicas int
	rl.FunctionConfig.GetOrDie(&replicas, "replicas")
	for i, obj := range rl.Items {
		if obj.APIVersion() == "apps/v1" && obj.Kind() == "Deployment" {
			rl.Items[i].SetOrDie(replicas, "spec", "replicas")
		}
	}
	return nil
}
