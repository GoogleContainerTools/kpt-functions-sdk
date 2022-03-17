package example_test

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/GoogleContainerTools/kpt-functions-catalog/functions/go/apply-replacements/replacements"
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example implements a function that updates the replicas field for all deployments.

func Example_builtinFunction() {
	reader := strings.NewReader(`
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items:
- kind: Deployment
  metadata:
    name: source
- kind: Service
  metadata:
    name: target
functionConfig:
  apiVersion: fn.kpt.dev/v1alpha1
  kind: ApplyReplacements
  metadata:
    name: replacements-fn-config
  replacements:
  - source: 
      kind: Deployment
    targets:
    - select:
        kind: Service`)

	var writer bytes.Buffer

	err := fn.Execute(&replacements.Replacements{}, reader, &writer)
	if err != nil {
		fmt.Println(err.Error())
	}

	fmt.Println(writer.String())

	// Output:

	// apiVersion: config.kubernetes.io/v1
	// kind: ResourceList
	// items:
	// - kind: Deployment
	//   metadata:
	//    name: source
	// - kind: Service
	//   metadata:
	//     name: source
	// functionConfig:
	//   apiVersion: fn.kpt.dev/v1alpha1
	//   kind: ApplyReplacements
	//   metadata:
	//     name: replacements-fn-config
	//   replacements:
	//   - source:
	//       kind: Deployment
	//     targets:
	//     - select:
	//         kind: Service
	//
}
