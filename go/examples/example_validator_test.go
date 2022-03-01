package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn"
)

// This example implements a function that validate resources to ensure
// spec.template.spec.securityContext.runAsNonRoot is set in workload APIs.

func Example_validator() {
	if err := krmfn.AsMain(krmfn.ResourceListProcessorFunc(validator)); err != nil {
		os.Exit(1)
	}
}

func validator(rl *krmfn.ResourceList) error {
	var results krmfn.Results
	for _, obj := range rl.Items {
		if obj.APIVersion() == "apps/v1" && (obj.Kind() == "Deployment" || obj.Kind() == "StatefulSet" || obj.Kind() == "DaemonSet" || obj.Kind() == "ReplicaSet") {
			var runAsNonRoot bool
			obj.GetOrDie(&runAsNonRoot, "spec", "template", "spec", "securityContext", "runAsNonRoot")
			if !runAsNonRoot {
				results = append(results, krmfn.ConfigObjectResult("`spec.template.spec.securityContext.runAsNonRoot` must be set to true", obj, krmfn.Error))
			}
		}
	}
	return results
}
