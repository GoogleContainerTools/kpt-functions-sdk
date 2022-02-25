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
	"encoding/json"

	"gopkg.in/yaml.v2"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

// UnmarshalJSON implements json.Unmarshaler.
func (u *Unstructured) UnmarshalJSON(data []byte) error {
	err := json.Unmarshal(data, &u.Object)
	if err != nil {
		return err
	}

	err = json.Unmarshal(data, &u.TypeMeta)
	if err != nil {
		return err
	}
	delete(u.Object, "kind")
	delete(u.Object, "apiVersion")

	meta, err := json.Marshal(u.Object["metadata"])
	if err != nil {
		return err
	}
	err = json.Unmarshal(meta, &u.ObjectMeta)
	if err != nil {
		return err
	}
	delete(u.Object, "metadata")

	return err
}

var _ json.Unmarshaler = &Unstructured{}

// MarshalJSON implements json.Marshaler.
func (u *Unstructured) MarshalJSON() ([]byte, error) {
	// Turn the Unstructured into a map.
	type unstructured_ Unstructured // prevent recursion
	data, err := json.MarshalIndent(unstructured_(*u), "", "  ")
	if err != nil {
		return nil, err
	}

	var m map[string]interface{}
	err = json.Unmarshal(data, &m)
	if err != nil {
		return nil, err
	}
	if m["metadata"].(map[string]interface{})["creationTimestamp"] == nil {
		// The omitempty directive on ObjectMeta.CreationTimestamp doesn't work properly, so it fills
		// it in with null unnecessarily. This deletes the creationTimestamp field if it is nil.
		delete(m["metadata"].(map[string]interface{}), "creationTimestamp")
	}

	for k, v := range u.Object {
		// Overrides struct fields.
		m[k] = v
	}

	return json.MarshalIndent(m, "", "  ")
}

var _ json.Marshaler = &Unstructured{}

// UnmarshalYAML implements yaml.Unmarshaler.
func (u *Unstructured) UnmarshalYAML(unmarshal func(interface{}) error) error {
	_ = unmarshal(&u.Object)
	// unmarshal fills in interface{} with map[interface{}]interface{}, but we need map[string]interface{} to properly
	// fill in fields for defined types. This makes this code incompatible with non-string keys, but such keys are
	// disallowed in the OpenAPI Spec anyway. Thus, normalizeMap().
	u.Object = normalizeMap(u.Object)

	var err error
	u.Kind, _, err = unstructured.NestedString(u.Object, "kind")
	if err != nil {
		return err
	}
	delete(u.Object, "kind")

	u.APIVersion, _, err = unstructured.NestedString(u.Object, "apiVersion")
	if err != nil {
		return err
	}
	delete(u.Object, "apiVersion")

	metadata, err := yaml.Marshal(u.Object["metadata"])
	if err != nil {
		return err
	}
	delete(u.Object, "metadata")
	return yaml.Unmarshal(metadata, &u.ObjectMeta)
}

var _ yaml.Unmarshaler = &Unstructured{}

func normalizeMap(object map[string]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range object {
		result[k] = normalize(v)
	}
	return result
}

func normalize(object interface{}) interface{} {
	switch o := object.(type) {
	case map[interface{}]interface{}:
		return normalizeInterfaceMap(o)
	case []interface{}:
		return normalizeArray(o)
	}
	return object
}

func normalizeInterfaceMap(object map[interface{}]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range object {
		result[k.(string)] = normalize(v)
	}
	return result
}

func normalizeArray(arr []interface{}) []interface{} {
	result := make([]interface{}, len(arr))
	for i, object := range arr {
		result[i] = normalize(object)
	}
	return result
}
