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
	"testing"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/framework/types"
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/testing/fake"
	"github.com/google/go-cmp/cmp"
	"github.com/google/go-cmp/cmp/cmpopts"
)

// TestFromJSONAndToConfigs ensures the marshalling process does not mutate the elements.
func TestFromJSONAndToConfigs(t *testing.T) {
	testCases := []struct {
		name  string
		items []types.KubernetesObject
	}{
		{
			name: "empty persists",
		},
		{
			name: "one entry persists",
			items: []types.KubernetesObject{
				fake.Namespace("1"),
			},
		},
		{
			name: "two entries persists",
			items: []types.KubernetesObject{
				fake.Namespace("2"),
				fake.Namespace("1"),
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			initialBytes, err := fromConfigs(types.Configs(tc.items), JSON)
			if err != nil {
				t.Fatal(err)
			}

			readConfigs, err := toConfigs(initialBytes, JSON)
			if err != nil {
				t.Fatal(err)
			}

			if len(readConfigs) != len(tc.items) {
				t.Fatalf("expected %d items but read %d", len(tc.items), len(readConfigs))
			}

			rewrittenBytes, err := fromConfigs(readConfigs, JSON)
			if err != nil {
				t.Fatal(err)
			}

			if diff := cmp.Diff(initialBytes, rewrittenBytes, cmpopts.EquateEmpty()); diff != "" {
				t.Fatalf(diff)
			}
		})
	}
}

// TestFromJSONAndToConfigs ensures the marshalling process does not mutate the elements.
func TestFromYAMLAndToConfigs(t *testing.T) {
	testCases := []struct {
		name  string
		items []types.KubernetesObject
	}{
		{
			name: "empty persists",
		},
		{
			name: "one entry persists",
			items: []types.KubernetesObject{
				fake.Namespace("1"),
			},
		},
		{
			name: "two entries persists",
			items: []types.KubernetesObject{
				fake.Namespace("2"),
				fake.Namespace("1"),
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			initialBytes, err := fromConfigs(types.Configs(tc.items), YAML)
			if err != nil {
				t.Fatal(err)
			}

			readConfigs, err := toConfigs(initialBytes, YAML)
			if err != nil {
				t.Fatal(err)
			}

			if len(readConfigs) != len(tc.items) {
				t.Fatalf("expected %d items but read %d", len(tc.items), len(readConfigs))
			}

			rewrittenBytes, err := fromConfigs(readConfigs, YAML)
			if err != nil {
				t.Fatal(err)
			}

			if diff := cmp.Diff(initialBytes, rewrittenBytes, cmpopts.EquateEmpty()); diff != "" {
				t.Fatalf(diff)
			}
		})
	}
}

func TestFormatsAreDifferent(t *testing.T) {
	configs := types.Configs([]types.KubernetesObject{fake.Namespace("foo")})

	jsonConfigs, err := fromConfigs(configs, JSON)
	if err != nil {
		t.Fatal(err)
	}
	yamlConfigs, err := fromConfigs(configs, YAML)
	if err != nil {
		t.Fatal(err)
	}

	_, expectedErr1 := toConfigs(jsonConfigs, YAML)
	if expectedErr1 == nil {
		t.Fatal("parsing JSON as YAML shouldn't work")
	}

	_, expectedErr2 := toConfigs(yamlConfigs, JSON)
	if expectedErr2 == nil {
		t.Fatal("parsing YAML as JSON shouldn't work")
	}
}
