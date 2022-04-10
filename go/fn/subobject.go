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

func (o *SubObject) GetMap(k string) *SubObject {
	m := o.obj.GetMap(k)
	if m == nil {
		return nil
	}
	return &SubObject{obj: m}
}

// GetSlice accepts a single key `k` whose value is expected to be a slice. It returns
// the value as a slice of SubObject. It panic with ErrSubObjectFields error if the
// field is not a slice type.
func (o *SubObject) GetSlice(k string) SliceSubObjects {
	return o.GetSliceNOrDie(k)
}

// GetSliceN accepts a slice of `fields` which represents the path to the slice component and
// return a slice of SubObjects as the first return value; whether the component exists or
// not as the second return value, and errors as the third return value.
func (o *SubObject) GetSliceN(fields ...string) (SliceSubObjects, bool, error) {
	var mapVariant *internal.MapVariant
	if len(fields) > 1 {
		m, found, err := o.obj.GetNestedMap(fields[:len(fields)-1]...)
		if err != nil || !found {
			return nil, found, err
		}
		mapVariant = m
	} else {
		mapVariant = o.obj
	}
	sliceVal, found, err := mapVariant.GetNestedSlice(fields[len(fields)-1])
	if err != nil {
		panic(ErrSubObjectFields{fields: fields})
	}
	if !found {
		return nil, found, nil
	}
	objects, err := sliceVal.Elements()
	if err != nil {
		return nil, found, err
	}
	var val []*SubObject
	for _, obj := range objects {
		val = append(val, &SubObject{obj: obj})
	}
	return val, true, nil
}

// GetSliceN accepts a slice of `fields` which represents the path to the slice component and
// return a slice of SubObjects.
// - It returns nil if the fields does not exist.
// - It panics with ErrSubObjectFields error if the field is not a slice type.
func (o *SubObject) GetSliceNOrDie(fields ...string) SliceSubObjects {
	val, _, err := o.GetSliceN(fields...)
	if err != nil {
		panic(ErrSubObjectFields{fields: fields})
	}
	return val
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
