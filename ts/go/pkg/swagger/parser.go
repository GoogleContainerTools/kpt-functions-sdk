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

const (
	BOOLEAN = "boolean"
	INTEGER = "integer"
	NUMBER  = "number"
	STRING  = "string"
	ARRAY   = "array"
	OBJECT  = "object"
)

// parser parses type definitions.
type parser struct {
	RefObjects map[Ref]Object
}

func newParser() parser {
	return parser{
		RefObjects: make(map[Ref]Object),
	}
}

// Type represents a swagger.json type in a field declaration.
type Type interface {
	// Imports is the set of imports required to use this Type.
	Imports() []Ref

	// NestedTypes returns the type definitions nested in this type.
	NestedTypes() []Object
}

// IsKubernetesObject returns true if we think the type is a KubernetesObject.
func IsKubernetesObject(refObjects map[Ref]Object, ref Ref) bool {
	if o, found := refObjects[ref]; found {
		return o.IsKubernetesObject
	}
	return false
}

// parseDefinition parses an entry in the swagger.json definitions map and returns the Definition it contains.
func (p parser) parseDefinition(key string, definitionMap map[string]interface{}) Definition {
	keyParts := strings.Split(key, ".")
	if len(keyParts) < 3 {
		panic(fmt.Sprintf("keys in definitions must have at least 3 parts: %s", key))
	}

	name := keyParts[len(keyParts)-1]
	groupVersion := strings.Join(keyParts[:len(keyParts)-1], ".")
	description, _ := getString("description", definitionMap)
	meta := DefinitionMeta{
		Name:        name,
		Package:     groupVersion,
		Description: description,
	}

	if isObject(definitionMap) {
		return p.parseObject(meta, definitionMap)
	}

	// We are guaranteed that the alias has no nested types as the type contains no "properties" field.
	return Alias{
		DefinitionMeta: meta,
		Type:           p.parseType(meta, definitionMap),
	}
}

func (p parser) parseType(meta DefinitionMeta, property map[string]interface{}) Type {
	if isObject(property) {
		// Structured Objects may or may not define "type": "object", so this check MUST happen before the typeString
		// switch below.
		panic(fmt.Sprintf("expected non-model property, but found 'properties': %+v", property))
	}

	// "$ref" and "type" should not be defined in the same Definition.
	if _, hasRef := property["$ref"]; hasRef {
		return newRef(property)
	}

	typeString, _ := getString("type", property)
	switch typeString {
	case BOOLEAN, INTEGER, NUMBER, STRING:
		return parsePrimitive(typeString, property)
	case ARRAY:
		return p.parseArray(meta, property)
	case OBJECT:
		// TODO(b/142004846): Handle rare edge case of "properties" and "additionalProperties" being defined.
		if _, hasAdditionalProperties := property["additionalProperties"]; hasAdditionalProperties {
			return p.newMap(meta, property)
		}
	}

	// Neither "properties", "$ref" nor "type" is defined, so we have no type information for this field.
	// Or, "type" is set to a value we don't parse.
	return Empty{}
}
