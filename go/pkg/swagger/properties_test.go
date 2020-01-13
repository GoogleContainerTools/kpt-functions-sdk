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
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

func TestProperties(t *testing.T) {
	testCases := []struct {
		name                string
		input               map[string]interface{}
		expectedProperties  map[string]Property
		expectedNestedTypes []Object
	}{
		{
			name:  "no properties",
			input: map[string]interface{}{},
		},
		{
			name: "one optional property",
			input: map[string]interface{}{
				"properties": map[string]interface{}{
					"spec": map[string]interface{}{},
				},
			},
			expectedProperties: map[string]Property{
				"spec": {
					Type: Empty{},
				},
			},
		},
		{
			name: "one required property",
			input: map[string]interface{}{
				"required": []interface{}{"spec"},
				"properties": map[string]interface{}{
					"spec": map[string]interface{}{},
				},
			},
			expectedProperties: map[string]Property{
				"spec": {
					Type:     Empty{},
					Required: true,
				},
			},
		},
		{
			name: "property with description",
			input: map[string]interface{}{
				"properties": map[string]interface{}{
					"spec": map[string]interface{}{
						"description": "a description",
					},
				},
			},
			expectedProperties: map[string]Property{
				"spec": {
					Description: "a description",
					Type:        Empty{},
				},
			},
		},
		{
			name: "two properties",
			input: map[string]interface{}{
				"required": []interface{}{"spec"},
				"properties": map[string]interface{}{
					"spec": map[string]interface{}{
						"type": "string",
					},
					"status": map[string]interface{}{},
				},
			},
			expectedProperties: map[string]Property{
				"spec": {
					Type:     KnownPrimitives.String,
					Required: true,
				},
				"status": {
					Type: Empty{},
				},
			},
		},
		{
			name: "unsupported property name",
			input: map[string]interface{}{
				"properties": map[string]interface{}{
					"x-kubernetes-embedded-resource": map[string]interface{}{},
				},
			},
			expectedProperties: map[string]Property{},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			p := newParser()
			properties, innerClasses := p.parseProperties(DefinitionMeta{}, tc.input)

			if diff := cmp.Diff(tc.expectedProperties, properties); diff != "" {
				t.Fatal(diff)
			}

			if diff := cmp.Diff(tc.expectedNestedTypes, innerClasses, cmpopts.SortSlices(func(p1, p2 Object) bool {
				return p1.Name < p2.Name
			})); diff != "" {
				t.Fatal(diff)
			}
		})
	}
}
