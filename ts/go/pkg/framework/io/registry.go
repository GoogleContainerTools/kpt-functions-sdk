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

package io

import (
	"encoding/json"

	"github.com/GoogleContainerTools/kpt-functions-sdk/ts/go/pkg/framework/types"
	"github.com/pkg/errors"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type newFn func() types.KubernetesObject

// Register registers a type to be unmarshalled into a specific type.
//
// gvk is the GroupVersioKind to parse.
// fn returns pointers to new objects of the desired type. Should return a new pointer to a new
// object each time it is called.
func Register(gvk schema.GroupVersionKind, fn newFn) {
	parser.registry[gvk] = fn
}

// toObject parses an Unstructured into its registered type if one exists. If unable to unmarshal
// into the declared type, returns an error.
func toObject(u types.Unstructured) (types.KubernetesObject, error) {
	if fn, exists := parser.registry[u.GroupVersionKind()]; exists {
		newObj := fn()

		bytes, err := json.Marshal(&u)
		if err != nil {
			return nil, errors.Wrap(err, "unable to marshal Unstructured")
		}
		err = json.Unmarshal(bytes, newObj)
		if err != nil {
			return nil, err
		}

		return newObj, err
	}
	return &u, nil
}

// fromObject returns a KubernetesObject to the original Unstructured, or error if a JSON
// problem arises.
func fromObject(obj types.KubernetesObject) (*types.Unstructured, error) {
	if u, ok := obj.(*types.Unstructured); ok {
		return u, nil
	}

	bytes, err := json.Marshal(obj)
	if err != nil {
		return nil, err
	}
	result := types.Unstructured{}
	err = result.UnmarshalJSON(bytes) // Should not fail since json.Marshal should return valid JSON.
	return &result, err
}

var parser = struct {
	registry map[schema.GroupVersionKind]newFn
}{
	registry: make(map[schema.GroupVersionKind]newFn),
}
