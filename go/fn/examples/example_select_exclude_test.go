package example

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// This example implements a function that selectively includes or excludes some resources.

func Example_selectExclude() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(selectResources)); err != nil {
		os.Exit(1)
	}
}

// selectResources keeps all resources with the GVK apps/v1 Deployment that do
// NOT have the label foo=bar, and removes the rest.
func selectResources(rl *fn.ResourceList) (bool, error) {
	rl.Items = rl.Items.Where(fn.IsGVK("apps/v1", "Deployment")).
		WhereNot(fn.HasLabels(map[string]string{"foo": "bar"}))
	return true, nil
}
