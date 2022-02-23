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
)

type testCase struct {
	name     string
	input    map[string]interface{}
	expected Type
}

func run(t *testing.T, testCases []testCase) {
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			p := newParser()
			result := p.parseType(DefinitionMeta{}, tc.input)

			if diff := cmp.Diff(tc.expected, result); diff != "" {
				t.Fatal(diff)
			}
		})
	}
}

func TestReferences(t *testing.T) {
	testCases := []testCase{
		{
			name: "reference",
			input: map[string]interface{}{
				"$ref": "#/definitions/io.k8s.api.core.v1.Pod",
			},
			expected: Ref{Package: "io.k8s.api.core.v1", Name: "Pod"},
		},
	}

	run(t, testCases)
}

func TestArrays(t *testing.T) {
	testCases := []testCase{
		{
			name: "array of KnownPrimitives",
			input: map[string]interface{}{
				"items": map[string]interface{}{
					"type": "string",
				},
				"type": "array",
			},
			expected: Array{Items: KnownPrimitives.String},
		},
		{
			name: "array of references",
			input: map[string]interface{}{
				"items": map[string]interface{}{
					"$ref": "#/definitions/io.k8s.api.core.v1.Pod",
				},
				"type": "array",
			},
			expected: Array{Items: Ref{Package: "io.k8s.api.core.v1", Name: "Pod"}},
		},
		{
			name: "array of arrays",
			input: map[string]interface{}{
				"items": map[string]interface{}{
					"items": map[string]interface{}{
						"type": "string",
					},
					"type": "array",
				},
				"type": "array",
			},
			expected: Array{Items: Array{Items: KnownPrimitives.String}},
		},
	}

	run(t, testCases)
}

func TestMaps(t *testing.T) {
	testCases := []testCase{
		{
			name: "array of KnownPrimitives",
			input: map[string]interface{}{
				"additionalProperties": map[string]interface{}{
					"type": "boolean",
				},
				"type": "object",
			},
			expected: Map{Values: KnownPrimitives.Boolean},
		},
		{
			name: "array of references",
			input: map[string]interface{}{
				"additionalProperties": map[string]interface{}{
					"$ref": "#/definitions/io.k8s.api.core.v1.Pod",
				},
				"type": "object",
			},
			expected: Map{Values: Ref{Package: "io.k8s.api.core.v1", Name: "Pod"}},
		},
		{
			name: "map of maps",
			input: map[string]interface{}{
				"additionalProperties": map[string]interface{}{
					"additionalProperties": map[string]interface{}{
						"type": "boolean",
					},
					"type": "object",
				},
				"type": "object",
			},
			expected: Map{Values: Map{Values: KnownPrimitives.Boolean}},
		},
	}

	run(t, testCases)
}

func TestObjects(t *testing.T) {
	testCases := []testCase{
		{
			name: "type set to object",
			input: map[string]interface{}{
				"type": "object",
			},
			expected: Empty{},
		},
		{
			name:     "no type or ref",
			input:    map[string]interface{}{},
			expected: Empty{},
		},
	}

	run(t, testCases)
}
