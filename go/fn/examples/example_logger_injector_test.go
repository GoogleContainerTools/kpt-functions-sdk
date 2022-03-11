package example

import (
	"os"

	corev1 "k8s.io/api/core/v1"
	yaml2 "sigs.k8s.io/kustomize/kyaml/yaml"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

// In this example, we implement a function that injects a logger as a sidecar
// container in workload APIs.

func Example_loggeInjector() {
	if err := fn.AsMain(fn.ResourceListProcessorFunc(injectLogger)); err != nil {
		os.Exit(1)
	}
}

// injectLogger injects a logger container into the workload API resources.
// generate implements the gokrmfn.KRMFunction interface.
func injectLogger(rl *fn.ResourceList) error {
	var li LoggerInjection
	if err := rl.FunctionConfig.As(&li); err != nil {
		return err
	}
	for i, obj := range rl.Items {
		if obj.APIVersion() == "apps/v1" && (obj.Kind() == "Deployment" || obj.Kind() == "StatefulSet" || obj.Kind() == "DaemonSet" || obj.Kind() == "ReplicaSet") {
			var containers []corev1.Container
			obj.GetOrDie(&containers, "spec", "template", "spec", "containers")
			foundTargetContainer := false
			for j, container := range containers {
				if container.Name == li.ContainerName {
					containers[j].Image = li.ImageName
					foundTargetContainer = true
					break
				}
			}
			if !foundTargetContainer {
				c := corev1.Container{
					Name:  li.ContainerName,
					Image: li.ImageName,
				}
				containers = append(containers, c)
			}
			rl.Items[i].SetOrDie(containers, "spec", "template", "spec", "containers")
		}
	}
	return nil
}

// LoggerInjection is type definition of the functionConfig.
type LoggerInjection struct {
	yaml2.ResourceMeta `json:",inline" yaml:",inline"`

	ContainerName string `json:"containerName" yaml:"containerName"`
	ImageName     string `json:"imageName" yaml:"imageName"`
}
