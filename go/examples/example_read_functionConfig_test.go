package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn"
	yaml2 "sigs.k8s.io/kustomize/kyaml/yaml"
)

// In this example, we convert the functionConfig as strong typed object and then
// read a field from the functionConfig object.

func Example_bReadFunctionConfig() {
	if err := krmfn.AsMain(krmfn.ResourceListProcessorFunc(readFunctionConfig)); err != nil {
		os.Exit(1)
	}
}

func readFunctionConfig(rl *krmfn.ResourceList) error {
	var sr SetReplicas
	rl.FunctionConfig.AsOrDie(&sr)
	krmfn.Logf("desired replicas is %v\n", sr.DesiredReplicas)
	return nil
}

// SetReplicas is the type definition of the functionConfig
type SetReplicas struct {
	yaml2.ResourceIdentifier `json:",inline" yaml:",inline"`
	DesiredReplicas          int `json:"desiredReplicas,omitempty" yaml:"desiredReplicas,omitempty"`
}
