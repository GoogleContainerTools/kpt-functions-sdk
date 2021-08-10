// Copyright 2021 Google LLC
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

package util

import (
	"reflect"
	"strings"
	"testing"

	kptfilev1 "github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/api/kptfile/v1"
)

func TestReadKptfile(t *testing.T) {
	type testcase struct {
		name        string
		input       string
		expected    *kptfilev1.KptFile
		expectedErr string
	}

	testcases := []testcase{
		{
			name: "valid v1 Kptfile",
			input: `apiVersion: kpt.dev/v1
kind: Kptfile
metadata:
  name: test
pipeline:
  mutators:
    - image: gcr.io/kpt-fn/starlark:unstable
      configPath: fn-config.yaml
`,
			expected: &kptfilev1.KptFile{
				ResourceMeta: kptfilev1.ResourceMeta{
					TypeMeta: kptfilev1.TypeMeta{
						APIVersion: "kpt.dev/v1",
						Kind:       "Kptfile",
					},
					ObjectMeta: kptfilev1.ObjectMeta{
						NameMeta: kptfilev1.NameMeta{
							Name: "test",
						},
					},
				},
				Pipeline: &kptfilev1.Pipeline{
					Mutators: []kptfilev1.Function{
						{
							Image:      "gcr.io/kpt-fn/starlark:unstable",
							ConfigPath: "fn-config.yaml",
						},
					},
				},
			},
		},
		{
			name: "invalid v1 Kptfile",
			input: `apiVersion: kpt.dev/v1alpha1
kind: Kptfile
metadata:
  name: nginx
packageMetadata:
  shortDescription: describe this package
upstream:
  type: git
  git:
    commit: 4d2aa98b45ddee4b5fa45fbca16f2ff887de9efb
    repo: https://github.com/GoogleContainerTools/kpt
    directory: package-examples/nginx
    ref: v0.2
openAPI:
  definitions:
    io.k8s.cli.setters.name:
      x-k8s-cli:
        setter:
          name: name
          value: the-map
`,
			expectedErr: "invalid 'v1' Kptfile",
		},
	}
	for _, tc := range testcases {
		actual, err := DecodeKptfile(tc.input)
		if tc.expectedErr != "" {
			if err == nil || !strings.Contains(err.Error(), tc.expectedErr) {
				t.Errorf("%q is failing: expect error: %v to contain %q", tc.name, err, tc.expectedErr)
				continue
			}
		} else {
			if err != nil {
				t.Errorf("%q is failing: got unexpected error: %v", tc.name, err)
				continue
			}
			if !reflect.DeepEqual(actual, tc.expected) {
				t.Errorf("%q is failing: expected: %+v, but got: %+v", tc.name, tc.expected, actual)
			}
		}
	}
}
