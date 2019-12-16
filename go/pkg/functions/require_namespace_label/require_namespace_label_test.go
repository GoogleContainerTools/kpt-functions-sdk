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

package require_namespace_label

import (
	"testing"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/framework/types"
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/testing/fake"
)

func TestRequireNamespaceLabel(t *testing.T) {
	foo := "foo"

	testCases := []struct {
		name        string
		props       types.Props
		configs     types.Configs
		expectError bool
	}{
		{
			name: "empty configs passes",
			props: types.Props{
				LabelProp: &foo,
			},
		},
		{
			name:        "missing required property fails",
			props:       types.Props{},
			expectError: true,
		},
		{
			name: "good Namespace passes",
			props: types.Props{
				LabelProp: &foo,
			},
			configs: types.Configs{
				func() types.KubernetesObject {
					n := fake.Namespace("good")
					n.SetLabels(map[string]string{
						foo: "set",
					})
					return n
				}(),
			},
		},
		{
			name: "bad Namespace fails",
			props: types.Props{
				LabelProp: &foo,
			},
			configs: types.Configs{
				func() types.KubernetesObject {
					n := fake.Namespace("bad")
					n.SetLabels(map[string]string{})
					return n
				}(),
			},
			expectError: true,
		},
		{
			name: "good and bad Namespace fails",
			props: types.Props{
				LabelProp: &foo,
			},
			configs: types.Configs{
				func() types.KubernetesObject {
					n := fake.Namespace("good")
					n.SetLabels(map[string]string{
						foo: "set",
					})
					return n
				}(),
				func() types.KubernetesObject {
					n := fake.Namespace("bad")
					n.SetLabels(map[string]string{})
					return n
				}(),
			},
			expectError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := RequireNamespaceLabel(&tc.configs, tc.props)
			if tc.expectError {
				if err == nil {
					t.Fatalf("expected error")
				}
			} else {
				if err != nil {
					t.Fatal(err)
				}
			}
		})
	}
}
