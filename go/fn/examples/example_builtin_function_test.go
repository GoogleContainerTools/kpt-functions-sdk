package example_test

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example removes all resources as a builtin function by using fn.Execute.

type RemoveAllResources struct{}

func (*RemoveAllResources) Process(rl *fn.ResourceList) error {
	rl.Items = nil
	return nil
}

func Example_builtinFunction() {
	reader := strings.NewReader(`
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items:
- kind: Deployment
  metadata:
    name: my-deploy
- kind: Service
  metadata:
    name: my-service
functionConfig:
  apiVersion: fn.kpt.dev/v1alpha1
  kind: RemoveAllResources
  metadata:
    name: fn-config`)

	var writer bytes.Buffer
	err := fn.Execute(&RemoveAllResources{}, reader, &writer)
	if err != nil {
		fmt.Println(err.Error())
	}
	fmt.Println(writer.String())

	// Output:
	// apiVersion: config.kubernetes.io/v1
	// kind: ResourceList
	// items: []
	// functionConfig:
	//   apiVersion: fn.kpt.dev/v1alpha1
	//   kind: RemoveAllResources
	//   metadata:
	//     name: fn-config
	//
}
