// Copyright 2021 The Kubernetes Authors.
// SPDX-License-Identifier: Apache-2.0

package krmfn

import (
	"reflect"
	"testing"

	"sigs.k8s.io/kustomize/kyaml/yaml"
)

func TestResults_Sort(t *testing.T) {
	testcases := []struct {
		name   string
		input  Results
		output Results
	}{
		{
			name: "sort based on severity",
			input: Results{
				{
					Message:  "Error message 1",
					Severity: Info,
				},
				{
					Message:  "Error message 2",
					Severity: Error,
				},
			},
			output: Results{
				{
					Message:  "Error message 2",
					Severity: Error,
				},
				{
					Message:  "Error message 1",
					Severity: Info,
				},
			},
		},
		{
			name: "sort based on file",
			input: Results{
				{
					Message:  "Error message",
					Severity: Error,
					File: &File{
						Path:  "resource.yaml",
						Index: 1,
					},
				},
				{
					Message:  "Error message",
					Severity: Info,
					File: &File{
						Path:  "resource.yaml",
						Index: 0,
					},
				},
				{
					Message:  "Error message",
					Severity: Info,
					File: &File{
						Path:  "other-resource.yaml",
						Index: 0,
					},
				},
				{
					Message:  "Error message",
					Severity: Warning,
					File: &File{
						Path:  "resource.yaml",
						Index: 2,
					},
				},
				{
					Message:  "Error message",
					Severity: Warning,
				},
			},
			output: Results{
				{
					Message:  "Error message",
					Severity: Warning,
				},
				{
					Message:  "Error message",
					Severity: Info,
					File: &File{
						Path:  "other-resource.yaml",
						Index: 0,
					},
				},
				{
					Message:  "Error message",
					Severity: Info,
					File: &File{
						Path:  "resource.yaml",
						Index: 0,
					},
				},
				{
					Message:  "Error message",
					Severity: Error,
					File: &File{
						Path:  "resource.yaml",
						Index: 1,
					},
				},
				{
					Message:  "Error message",
					Severity: Warning,
					File: &File{
						Path:  "resource.yaml",
						Index: 2,
					},
				},
			},
		},

		{
			name: "sort based on other fields",
			input: Results{
				{
					Message:  "Error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "Pod",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "spec",
					},
				},
				{
					Message:  "Error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "Pod",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "metadata.name",
					},
				},
				{
					Message:  "Another error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "Pod",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "metadata.name",
					},
				},
				{
					Message:  "Another error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "ConfigMap",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "metadata.name",
					},
				},
			},
			output: Results{
				{
					Message:  "Another error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "ConfigMap",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "metadata.name",
					},
				},
				{
					Message:  "Another error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "Pod",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "metadata.name",
					},
				},
				{
					Message:  "Error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "Pod",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "metadata.name",
					},
				},
				{
					Message:  "Error message",
					Severity: Error,
					ResourceRef: &yaml.ResourceIdentifier{
						TypeMeta: yaml.TypeMeta{
							APIVersion: "v1",
							Kind:       "Pod",
						},
						NameMeta: yaml.NameMeta{
							Namespace: "foo-ns",
							Name:      "bar",
						},
					},
					Field: &Field{
						Path: "spec",
					},
				},
			},
		},
	}

	for _, tc := range testcases {
		tc.input.Sort()
		if !reflect.DeepEqual(tc.input, tc.output) {
			t.Errorf("in testcase %q, expect: %#v, but got: %#v", tc.name, tc.output, tc.input)
		}
	}
}
