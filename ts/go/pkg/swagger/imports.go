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
	"strings"
)

func refMatches(ref Ref, filter []string) bool {
	fullName := ref.Name
	if ref.Package != "" {
		fullName = ref.Package + "." + fullName
	}
	if !strings.HasPrefix(fullName, filter[0]) {
		return false
	}

	idx := len(filter[0])
	for i := range filter {
		if i == 0 {
			continue
		}
		inc := strings.Index(fullName[idx:], filter[i])
		if inc == -1 {
			return false
		}
		idx += inc + len(filter[i])
	}
	return true
}

// FilterDefinitions returns the filtered subset of Definitions and their transitive dependencies.
func FilterDefinitions(filters []string, allPackages map[string][]Definition) map[string][]Definition {
	// Record all definitions by their reference.
	allDefinitions := make(map[Ref]Definition)
	// Record all package-level dependencies.
	allDependencies := make(map[Ref]map[Ref]bool)
	for _, definitions := range allPackages {
		for _, definition := range definitions {
			ref := definition.Meta().ToRef()
			// Map reference to its definition.
			allDefinitions[ref] = definition
			// Determine dependencies for this definition.
			allDependencies[ref] = make(map[Ref]bool)
			imports := definition.Imports()
			for _, i := range imports {
				allDependencies[ref][i] = true
			}
		}
	}

	// Record Refs matching filters.
	var refs []Ref
	for _, definitions := range allPackages {
		for _, definition := range definitions {
			for _, filter := range filters {
				ref := definition.Meta().ToRef()
				if refMatches(ref, strings.Split(filter, "*")) {
					refs = append(refs, ref)
					break
				}
			}
		}
	}

	// Determine set of included Definitions and their transitive dependencies.
	definitions := make(map[Ref]Definition)
	for i := 0; i < len(refs); i++ {
		ref := refs[i]
		if _, found := definitions[ref]; found {
			// We have already included this Definition.
			continue
		}
		if strings.Contains(ref.Name, ".") {
			// This is a ref to a nested class and already implicitly included.
			continue
		}

		// Include this definition
		definitions[ref] = allDefinitions[ref]

		// Mark all dependencies of this definition to be included.
		for dependency := range allDependencies[ref] {
			refs = append(refs, dependency)
		}
	}

	// Fill in included Definitions.
	result := make(map[string][]Definition)
	for ref, definition := range definitions {
		result[ref.Package] = append(result[ref.Package], definition)
	}
	return result
}
