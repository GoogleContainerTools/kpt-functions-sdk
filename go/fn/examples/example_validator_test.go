package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example implements a function that validate resources to ensure
// spec.template.spec.securityContext.runAsNonRoot is set in workload APIs.

func Example_validator() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(validator)); err != nil {
		os.Exit(1)
	}
}

func validator(rl *fn.ResourceList) error {
	var results fn.Results
	for _, obj := range rl.Items {
		if obj.GetAPIVersion() == "apps/v1" && (obj.GetKind() == "Deployment" || obj.GetKind() == "StatefulSet" || obj.GetKind() == "DaemonSet" || obj.GetKind() == "ReplicaSet") {
			var runAsNonRoot bool
			obj.GetOrDie(&runAsNonRoot, "spec", "template", "spec", "securityContext", "runAsNonRoot")
			if !runAsNonRoot {
				results = append(results, fn.ConfigObjectResult("`spec.template.spec.securityContext.runAsNonRoot` must be set to true", obj, fn.Error))
			}
		}
	}
	return results
}
