// Copyright 2022 Google LLC
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

package fn

import (
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn/internal"
	"sigs.k8s.io/kustomize/kyaml/yaml"
)

// SubObject represents a map within a KubeObject
type SubObject struct {
	obj *internal.MapVariant
}

func (o *SubObject) UpsertMap(k string) *SubObject {
	m := o.obj.UpsertMap(k)
	return &SubObject{obj: m}
}

// GetMap accepts a single key `k` whose value is expected to be a map. It returns
// the map in the form of a SubObject pointer.
// It panic with ErrSubObjectFields error if the field cannot be represented as a SubObject.
func (o *SubObject) GetMap(k string) *SubObject {
	return o.NestedMapOrDie(k)
}

// GetBool accepts a single key `k` whose value is expected to be a boolean. It returns
// the int value of the `k`. It panic with ErrSubObjectFields error if the
// field is not an integer type.
func (o *SubObject) GetBool(k string) bool {
	return o.NestedBoolOrDie(k)
}

// GetInt accepts a single key `k` whose value is expected to be an integer. It returns
// the int value of the `k`. It panic with ErrSubObjectFields error if the
// field is not an integer type.
func (o *SubObject) GetInt(k string) int64 {
	return o.NestedInt64OrDie(k)
}

// GetString accepts a single key `k` whose value is expected to be a string. It returns
// the value of the `k`. It panic with ErrSubObjectFields error if the
// field is not a string type.
func (o *SubObject) GetString(k string) string {
	return o.NestedStringOrDie(k)
}

// GetSlice accepts a single key `k` whose value is expected to be a slice. It returns
// the value as a slice of SubObject. It panic with ErrSubObjectFields error if the
// field is not a slice type.
func (o *SubObject) GetSlice(k string) SliceSubObjects {
	return o.NestedSliceOrDie(k)
}

type SliceSubObjects []*SubObject

// MarshalJSON provides the custom encoding format for encode.json. This is used
// when KubeObject `Set` a slice of SubObjects.
func (s *SliceSubObjects) MarshalJSON() ([]byte, error) {
	node := &yaml.Node{Kind: yaml.SequenceNode}
	for _, subObject := range *s {
		node.Content = append(node.Content, subObject.obj.Node())
	}
	return yaml.NewRNode(node).MarshalJSON()
}
