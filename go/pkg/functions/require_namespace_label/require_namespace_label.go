// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package require_namespace_label

import (
	"fmt"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/framework/io"
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/framework/types"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func init() {
	io.Register(metav1.Unversioned.WithKind("Namespace"), func() types.KubernetesObject {
		return &corev1.Namespace{}
	})
}

// TODO(b/138235381): Add example using non-default field.

// LabelProp is the required label property key.
const LabelProp = "label"

// RequireNamespaceLabel requires that a specific label be set on every Namespace.
func RequireNamespaceLabel(configs *types.Configs, props types.Props) error {
	requiredLabel, found := props[LabelProp]
	if !found || *requiredLabel == "" {
		return fmt.Errorf("missing required property: %s", LabelProp)
	}

	var failures []types.KubernetesObject
	for _, config := range *configs {
		ns, isNamespace := config.(*corev1.Namespace)
		if !isNamespace {
			continue
		}
		if _, foundLabel := ns.GetLabels()[*requiredLabel]; !foundLabel {
			failures = append(failures, ns)
		}
	}

	if len(failures) > 0 {
		return types.NewManifestError(fmt.Sprintf("found Namespaces with missing required label %q", *requiredLabel), failures...)
	}
	return nil
}
