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

package internal

import (
	"sigs.k8s.io/kustomize/kyaml/yaml"
)

type sliceVariant struct {
	node *yaml.Node
}

func NewSliceVariant(s ...variant) *sliceVariant {
	node := buildSequenceNode()
	for _, v := range s {
		node.Content = append(node.Content, v.Node())
	}
	return &sliceVariant{node: node}
}

func (v *sliceVariant) GetKind() variantKind {
	return variantKindSlice
}

func (v *sliceVariant) Node() *yaml.Node {
	return v.node
}

func (v *sliceVariant) Clear() {
	v.node.Content = nil
}

func (v *sliceVariant) Objects() ([]*MapVariant, error) {
	return extractObjects(v.node.Content...)
}

func (v *sliceVariant) Add(node variant) {
	v.node.Content = append(v.node.Content, node.Node())
}

func (o *sliceVariant) GetSliceElementBySelector(field string) (*MapVariant, error) {
	key, expected := GetEqualSelector(field)
	elements, err := o.Objects()
	if err != nil {
		return nil, err
	}
	for _, mapElement := range elements {
		actual, found, err := mapElement.GetNestedString(key)
		if !found {
			continue
		}
		if err != nil {
			return nil, err
		}
		if actual == expected {
			return mapElement, nil
		}
	}
	return nil, nil
}
