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

package types

import (
	"errors"
	"fmt"
	"strings"

	"github.com/GoogleContainerTools/kpt-functions-sdk/ts/go/pkg/framework/constants"
)

// Error implements error.
func (e *ConfigError) Error() string {
	return e.error.Error()
}

// Log prints the error to standard output.
func (e *ConfigError) Log() {
	fmt.Print(e.error)
}

// IsConfigError returns true if the error is a ConfigError.
func IsConfigError(e error) bool {
	_, ok := e.(*ConfigError)
	return ok
}

// NewConfigError returns a ConfigError with the specified message.
func NewConfigError(msg string) *ConfigError {
	return &ConfigError{error: errors.New(msg)}
}

// NewManifestError reports an error on a specific set of manifests.
func NewManifestError(msg string, objects ...KubernetesObject) *ConfigError {
	manifestInfos := make([]string, len(objects))
	for i, o := range objects {
		manifestInfos[i] = printManifest(o)
	}
	manifests := strings.Join(manifestInfos, "")
	return NewConfigError(fmt.Sprintf("%s:\n%s", msg, manifests))
}

// printManifest prints all necessary information to uniquely identify the manifest declaring an
// object. If the object has no source file, explicitly marks the object as not having a source
// file.
func printManifest(o KubernetesObject) string {
	fileName, found := o.GetAnnotations()[constants.SourcePathAnnotation]
	if !found {
		// The object has no source file.
		// This could be the case for types generated from templates or recommenders.
		fileName = "[no source file]"
	}
	return fmt.Sprintf(`
file: %q
apiVersion: %q
kind: %q
metadata.namespace: %q
metadata.name: %q
`, fileName, o.GroupVersionKind().GroupVersion().String(), o.GroupVersionKind().Kind, o.GetNamespace(), o.GetName())
}
