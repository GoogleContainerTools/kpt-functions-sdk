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

package swagger

import (
	"fmt"
	"strings"
)

// Ref references another type which has already been defined.
// Defined in "$ref"
type Ref struct {
	Package string
	Name    string
}

// GroupVersionKind holds the Kubernetes GroupVersionKind.
type GroupVersionKind struct {
	Group   string
	Version string
	Kind    string
}

// APIVersion returns the formatted APIVersion.
func (gvk GroupVersionKind) APIVersion() string {
	if gvk.Group == "" {
		return gvk.Version
	}
	return fmt.Sprintf("%s/%s", gvk.Group, gvk.Version)
}

var _ Type = Ref{}

func newRef(r map[string]interface{}) Ref {
	ref := getRequiredString("$ref", r)

	if !strings.HasPrefix(ref, "#/definitions/") {
		panic(fmt.Sprintf("invalid $ref, must begin with '#/definitions/': %s", r))
	}
	i := strings.LastIndex(ref, ".")

	return Ref{
		Package: ref[14:i],
		Name:    ref[i+1:],
	}
}

// Imports implements Type.
func (r Ref) Imports() []Ref {
	return []Ref{r}
}

// NestedTypes implements Type.
func (Ref) NestedTypes() []Object {
	return nil
}
