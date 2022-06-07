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

import "strings"

// Array is an array of any Type.
type Array struct {
	// Items is the type of elements in the Array. Defined in the "Items" field.
	Items Type

	// Nested is the set of types nested in this Array. Guaranteed to be either empty or contain exactly one element.
	Nested []Object
}

var _ Type = Array{}

// Imports implements Type.
func (a Array) Imports() []Ref {
	// An Array's imports may be either the Item it is an array of or the imports required for its nested field.
	return a.Items.Imports()
}

// NestedTypes implements Type.
func (a Array) NestedTypes() []Object {
	// Arrays may define their "items" type inline, creating a nested field.
	return a.Nested
}

func (p parser) parseArray(definitionMeta DefinitionMeta, o map[string]interface{}) Array {
	itemsMap := getRequiredMap("items", o)
	if isObject(itemsMap) {
		description, _ := getString("description", itemsMap)
		meta := DefinitionMeta{
			Name:        "Item",
			Package:     definitionMeta.Package,
			Namespace:   append(definitionMeta.Namespace, definitionMeta.Name),
			Description: description,
		}
		object := p.parseObject(meta, itemsMap)
		return Array{
			Items: Ref{
				Package: definitionMeta.Package,
				Name:    strings.Join(append(meta.Namespace, "Item"), "."),
			},
			Nested: []Object{object},
		}
	}
	return Array{
		Items: p.parseType(definitionMeta, itemsMap),
	}
}
