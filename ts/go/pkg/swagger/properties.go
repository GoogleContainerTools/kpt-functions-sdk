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

type Property struct {
	Type          Type
	Description   string
	Required      bool
	OverrideValue string
}

func (p Property) withRequired() Property {
	p.Required = true
	return p
}

func (p Property) withType(t Type) Property {
	p.Type = t
	return p
}

// parseProperties parses the []Properties defined by a Model.
//
// Returns the contained properties and nested type definitions.
func (p parser) parseProperties(definitionMeta DefinitionMeta, model map[string]interface{}) (map[string]Property, []Object) {
	requiredFields, _ := getStringArray("required", model)
	required := make(map[string]bool)
	for _, field := range requiredFields {
		required[field] = true
	}

	propertiesMap, hasProperties := getMap("properties", model)
	if !hasProperties {
		return nil, nil
	}

	properties := make(map[string]Property)
	var nestedTypes []Object
	for name := range propertiesMap {
		if isUnsupportedProperty(name) {
			continue
		}

		propertyMap := getRequiredMap(name, propertiesMap)

		description, _ := getString("description", propertyMap)

		var typ Type
		if isObject(propertyMap) {
			// This property has "properties", so it is an object with a complex definition.
			propertyType := strings.Title(name)
			propertyDefinitionMeta := DefinitionMeta{
				Name:        propertyType,
				Package:     definitionMeta.Package,
				Namespace:   append(definitionMeta.Namespace, definitionMeta.Name),
				Description: description,
			}
			object := p.parseObject(propertyDefinitionMeta, propertyMap)
			nestedTypes = append(nestedTypes, object)
			typ = Ref{
				Name:    strings.Join(append(propertyDefinitionMeta.Namespace, propertyType), "."),
				Package: definitionMeta.Package,
			}
		} else {
			typ = p.parseType(definitionMeta, propertyMap)
		}

		properties[name] = Property{
			Type:        typ,
			Description: description,
			Required:    required[name],
		}
		nestedTypes = append(nestedTypes, typ.NestedTypes()...)
	}

	return properties, nestedTypes
}

// Excludes properties that are k8s extensions (e.g. x-kubernetes-*) since they cause issues when generating fields in e.g. TS.
// This currently only affects CRD definition like
// io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1beta1.JSONSchemaProps
// We can consider better handling this if it's a real use case.
func isUnsupportedProperty(name string) bool {
	return strings.Contains(name, "x-kubernetes-")
}
