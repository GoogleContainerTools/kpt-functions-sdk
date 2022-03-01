package example_test

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn"
)

// This example implements a function that updates the replicas field for all deployments.

func Example_filterGVK() {
	if err := krmfn.AsMain(krmfn.ResourceListProcessorFunc(updateReplicas)); err != nil {
		os.Exit(1)
	}
}

// updateReplicas sets a field in resources selecting by GVK.
func updateReplicas(rl *krmfn.ResourceList) error {
	if rl.FunctionConfig == nil {
		return krmfn.ErrMissingFnConfig{}
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
