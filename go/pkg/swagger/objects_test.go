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

	"github.com/google/go-cmp/cmp/cmpopts"

	"github.com/google/go-cmp/cmp"
)

func TestParseDefinition(t *testing.T) {
	testCases := []struct {
		name      string
		modelName string
		input     map[string]interface{}
		expected  Definition
	}{
		{
			name:      "Empty declaration",
			modelName: "io.v1.Empty",
			input:     map[string]interface{}{},
			expected: Alias{
				DefinitionMeta: DefinitionMeta{
					Name:    "Empty",
					Package: "io.v1",
				},
				Type: Empty{},
			},
		},
		{
			name:      "Type reference",
			modelName: "io.v1alpha1.Pod",
			input: map[string]interface{}{
				"$ref": "#/definitions/io.v1.Pod",
			},
			expected: Alias{
				DefinitionMeta: DefinitionMeta{
					Name:    "Pod",
					Package: "io.v1alpha1",
				},
				Type: Ref{
					Package: "io.v1",
					Name:    "Pod",
				},
			},
		},
		{
			name:      "Type alias",
			modelName: "io.v1.Quantity",
			input: map[string]interface{}{
				"type":   "integer",
				"format": "int32",
			},
			expected: Alias{
				DefinitionMeta: DefinitionMeta{
					Name:    "Quantity",
					Package: "io.v1",
				},
				Type: KnownPrimitives.Integer,
			},
		},
		{
			name:      "Model with two fields",
			modelName: "io.v1.Pod",
			input: map[string]interface{}{
				"description": "a simple Pod model",
				"properties": map[string]interface{}{
					"podType": map[string]interface{}{
						"type": "string",
					},
					"spec": map[string]interface{}{
						"description": "unstructured spec field",
					},
				},
			},
			expected: Object{
				DefinitionMeta: DefinitionMeta{
					Name:        "Pod",
					Package:     "io.v1",
					Description: "a simple Pod model",
				},
				Properties: map[string]Property{
					"podType": {
						Type: KnownPrimitives.String,
					},
					"spec": {
						Type:        Empty{},
						Description: "unstructured spec field",
					},
				},
			},
		},
		{
			name:      "Model with nested type with nested type",
			modelName: "io.v1.Pod",
			input: map[string]interface{}{
				"description": "a complex Pod model",
				"properties": map[string]interface{}{
					"spec": map[string]interface{}{
						"properties": map[string]interface{}{
							"restartStrategy": map[string]interface{}{
								"properties": map[string]interface{}{},
							},
						},
					},
				},
			},
			expected: Object{
				DefinitionMeta: DefinitionMeta{
					Name:        "Pod",
					Package:     "io.v1",
					Description: "a complex Pod model",
				},
				Properties: map[string]Property{
					"spec": {
						Type: Ref{
							Package: "io.v1",
							Name:    "Pod.Spec",
						},
					},
				},
				NestedTypes: []Object{
					{
						DefinitionMeta: DefinitionMeta{
							Name:      "Spec",
							Package:   "io.v1",
							Namespace: []string{"Pod"},
						},
						Properties: map[string]Property{
							"restartStrategy": {
								Type: Ref{
									Package: "io.v1",
									Name:    "Pod.Spec.RestartStrategy",
								},
							},
						},
						NestedTypes: []Object{
							{
								DefinitionMeta: DefinitionMeta{
									Name:      "RestartStrategy",
									Package:   "io.v1",
									Namespace: []string{"Pod", "Spec"},
								},
							},
						},
					},
				},
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			p := newParser()
			result := p.parseDefinition(tc.modelName, tc.input)

			if diff := cmp.Diff(tc.expected, result, cmpopts.EquateEmpty()); diff != "" {
				t.Fatal(diff)
			}
		})
	}
}
