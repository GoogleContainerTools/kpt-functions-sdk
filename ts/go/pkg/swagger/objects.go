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
	"sort"
)

// Object corresponds to structured Objects with "properties" but no "additionalProperties".
type Object struct {
	DefinitionMeta

	// Properties is the set of properties this Object declares.
	Properties map[string]Property

	// NestedTypes are all types which only exist inside this Object's definition.
	NestedTypes []Object

	// IsKubernetesObject is true if Object represents a KubernetesObject type.
	IsKubernetesObject bool

	// GroupVersionKinds holds the set of declared GroupVersionKinds this type may validly have.
	// Must be nonempty to be a KubernetesObject. A Definition may declare many GroupVersionKinds.
	GroupVersionKinds []GroupVersionKind
}

// NamedProperty is a Property and its name.
type NamedProperty struct {
	Name string
	Property
}

// NamedProperties returns the Properties of the Object, sorted by their name.
func (o Object) NamedProperties() []NamedProperty {
	var namedProperties []NamedProperty
	for name, property := range o.Properties {
		namedProperties = append(namedProperties, NamedProperty{Name: name, Property: property})
	}
	sort.Slice(namedProperties, func(i, j int) bool {
		return namedProperties[i].Name < namedProperties[j].Name
	})
	return namedProperties
}

// GroupVersionKind returns the first listed GroupVersionKind for the type, if there is one.
func (o Object) GroupVersionKind() *GroupVersionKind {
	// TODO(b/142004166): Handle the case where a type declares multiple GroupVersionKinds.
	if len(o.GroupVersionKinds) > 0 {
		return &o.GroupVersionKinds[0]
	}
	return nil
}

// HasRequiredFields returns true if the Object contains any required fields.
func (o Object) HasRequiredFields() bool {
	for _, property := range o.Properties {
		if property.Required {
			return true
		}
	}
	return false
}

// Imports implements Definition.
func (o Object) Imports() []Ref {
	var result []Ref
	for _, p := range o.Properties {
		result = append(result, p.Type.Imports()...)
	}
	for _, n := range o.NestedTypes {
		result = append(result, n.Imports()...)
	}
	return result
}

// Meta implements Definition.
func (o Object) Meta() DefinitionMeta {
	return o.DefinitionMeta
}

func isObject(m map[string]interface{}) bool {
	_, result := m["properties"]
	return result
}

// parseObject parses a model given its key in the definitions map and the map holding all of its information.
func (p parser) parseObject(meta DefinitionMeta, model map[string]interface{}) Object {
	properties, nestedTypes := p.parseProperties(meta, model)

	o := Object{
		DefinitionMeta: meta,
		NestedTypes:    nestedTypes,
		Properties:     properties,
	}

	if gvks, containsGVK := model["x-kubernetes-group-version-kind"]; containsGVK {
		o.GroupVersionKinds = getGVKs(gvks)

		// The object declares GroupVersionKind, so require that apiVersion and kind exist even if they aren't declared.
		o.Properties["apiVersion"] = o.Properties["apiVersion"].withRequired().withType(KnownPrimitives.String)
		o.Properties["kind"] = o.Properties["kind"].withRequired().withType(KnownPrimitives.String)

		// There are types with GVK but no "metadata". These aren't usually recognized by the API Server, and are
		// usually required for ones that are.
		if metadata, hasMetadata := o.Properties["metadata"]; hasMetadata {
			if ref, isRef := metadata.Type.(Ref); isRef {
				// TODO(b/142003702): Allow other ObjectMeta types.
				if ref.Name == "ObjectMeta" && ref.Package == "io.k8s.apimachinery.pkg.apis.meta.v1" {
					// Types don't usually declare "metadata" as required even though they actually are.
					properties["metadata"] = properties["metadata"].withRequired()
					o.IsKubernetesObject = true
				}
			}
		}
	}

	if o.DefinitionMeta.Package == "io.k8s.apimachinery.pkg.apis.meta.v1" && o.DefinitionMeta.Name == "ObjectMeta" {
		// Normally either "name" or "generateName" must be defined in ObjectMeta. We don't support "generateName", so
		// we require "name".
		o.Properties["name"] = o.Properties["name"].withRequired()
	}

	p.RefObjects[o.ToRef()] = o
	return o
}

func getGVKs(gvks interface{}) []GroupVersionKind {
	var result []GroupVersionKind
	gvksArray, ok := gvks.([]interface{})
	if !ok {
		panic(fmt.Sprintf("x-kubernetes-group-version-kind must be an array: %+v", gvks))
	}

	for _, gvkInterface := range gvksArray {
		gvkMap, isMap := gvkInterface.(map[string]interface{})
		if !isMap {
			panic(fmt.Sprintf("x-kubernetes-group-version-kind must be an array of maps: %+v", gvks))
		}
		result = append(result, GroupVersionKind{
			Group:   getRequiredString("group", gvkMap),
			Version: getRequiredString("version", gvkMap),
			Kind:    getRequiredString("kind", gvkMap),
		})
	}
	return result
}
