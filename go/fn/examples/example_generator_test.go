package example

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// This function generates Graphana configuration in the form of ConfigMap. It
// accepts Revision and ID as input.

func Example_generator() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(generate)); err != nil {
		os.Exit(1)
	}
}

// generate generates a ConfigMap.
func generate(rl *fn.ResourceList) error {
	if rl.FunctionConfig == nil {
		return fn.ErrMissingFnConfig{}
	}

	revision := rl.FunctionConfig.GetStringOrDie("data", "revision")
	id := rl.FunctionConfig.GetStringOrDie("data", "id")
	js, err := fetchDashboard(revision, id)
	if err != nil {
		return fmt.Errorf("fetch dashboard: %v", err)
	}

	cm := corev1.ConfigMap{
		TypeMeta: metav1.TypeMeta{
			APIVersion: "v1",
			Kind:       "ConfigMap",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name:      fmt.Sprintf("%v-gen", rl.FunctionConfig.GetName()),
			Namespace: rl.FunctionConfig.GetNamespace(),
			Labels: map[string]string{
				"grafana_dashboard": "true",
			},
		},
		Data: map[string]string{
			fmt.Sprintf("%v.json", rl.FunctionConfig.GetName()): fmt.Sprintf("%q", js),
		},
	}
	return rl.UpsertObjectToItems(cm, nil, false)
}

func fetchDashboard(revision, id string) (string, error) {
	url := fmt.Sprintf("https://grafana.com/api/dashboards/%s/revisions/%s/download", id, revision)
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	return string(b), nil
}
