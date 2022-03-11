package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
	yaml2 "sigs.k8s.io/kustomize/kyaml/yaml"
)

// In this example, we convert the functionConfig as strong typed object and then
// read a field from the functionConfig object.

func Example_bReadFunctionConfig() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(readFunctionConfig)); err != nil {
		os.Exit(1)
	}
}

func readFunctionConfig(rl *fn.ResourceList) error {
	var sr SetReplicas
	rl.FunctionConfig.AsOrDie(&sr)
	fn.Logf("desired replicas is %v\n", sr.DesiredReplicas)
	return nil
}

// SetReplicas is the type definition of the functionConfig
type SetReplicas struct {
	yaml2.ResourceIdentifier `json:",inline" yaml:",inline"`
	DesiredReplicas          int `json:"desiredReplicas,omitempty" yaml:"desiredReplicas,omitempty"`
}
