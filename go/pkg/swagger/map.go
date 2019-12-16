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

// Map is a map from strings to any Type.
//
// Corresponds to swagger's Free-Form Object with "additionalProperties" but no "properties" defined.
type Map struct {
	// Values is the type of Values in the map. Defined in the "additionalProperties" field.
	Values Type
}

var _ Type = Map{}

func (p parser) newMap(meta DefinitionMeta, o map[string]interface{}) Map {
	additionalPropertiesMap := getRequiredMap("additionalProperties", o)
	// TODO(b/141928662): Handle map of nested type. Uncommon case.
	if isObject(additionalPropertiesMap) {
		return Map{
			Values: Empty{},
		}
	}
	return Map{
		Values: p.parseType(meta, additionalPropertiesMap),
	}
}

// Imports implements Type.
func (m Map) Imports() []Ref {
	return m.Values.Imports()
}

// NestedTypes implements Type.
func (Map) NestedTypes() []Object {
	// Will change once we support maps of nested type.
	return nil
}
