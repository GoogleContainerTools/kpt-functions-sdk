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

import "sort"

// ParseSwagger parses a Swagger map into an array of Definitions.
//
// Returns Definitions are sorted by fully-qualified name and amap from all References to Definitions to the Definitions.
func ParseSwagger(swagger map[string]interface{}) ([]Definition, map[Ref]Object) {
	definitions := getRequiredMap("definitions", swagger)
	var result []Definition
	p := newParser()
	for name := range definitions {
		definition := getRequiredMap(name, definitions)
		result = append(result, p.parseDefinition(name, definition))
	}
	sort.Slice(result, func(i, j int) bool {
		return FullName(result[i]) < FullName(result[j])
	})
	return result, p.RefObjects
}
