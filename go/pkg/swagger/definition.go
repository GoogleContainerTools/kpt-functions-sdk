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

import "fmt"

// Definition corresponds to a specific type in a swagger.json file. This includes all types in the "definitions" map
// as well as any nested types.
type Definition interface {
	// Meta returns the metadata for this Definition.
	Meta() DefinitionMeta
	// Imports are the imports required to use this Definition.
	Imports() []Ref
}

// DefinitionMeta holds metadata common to all definitions.
type DefinitionMeta struct {
	// Name is the name of the definition being declared.
	Name string
	// Package is the APIVersion containing this definition.
	Package string
	// Namespace marks nested definitions which should be contained by their outer definition if the language allows it.
	Namespace []string
	// Description is the human-readable textual comment describing this definition.
	Description string
}

func (d DefinitionMeta) ToRef() Ref {
	return Ref{
		Name:    d.Name,
		Package: d.Package,
	}
}

// FullName implements Definition.
func FullName(d Definition) string {
	return fmt.Sprintf("%s.%s", d.Meta().Package, d.Meta().Name)
}
