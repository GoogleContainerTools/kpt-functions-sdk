// Copyright 2019 The Kubernetes Authors.
// SPDX-License-Identifier: Apache-2.0

package kio_test

import (
	"bytes"
	"reflect"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn/internal/forked/kyaml/kio"
	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn/internal/forked/kyaml/kio/kioutil"
	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn/internal/forked/kyaml/yaml"
)

func TestPipe(t *testing.T) {
	p := kio.Pipeline{
		Inputs:  []kio.Reader{},
		Filters: []kio.Filter{},
		Outputs: []kio.Writer{},
	}

	err := p.Execute()
	if !assert.NoError(t, err) {
		assert.FailNow(t, err.Error())
	}
}

type mockCallback struct {
	mock.Mock
}

func (c *mockCallback) Callback(op kio.Filter) {
	c.Called(op)
}

func TestPipelineWithCallback(t *testing.T) {
	input := kio.ResourceNodeSlice{yaml.MakeNullNode()}
	noopFilter1 := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		return nodes, nil
	}
	noopFilter2 := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		return nodes, nil
	}
	filters := []kio.Filter{
		kio.FilterFunc(noopFilter1),
		kio.FilterFunc(noopFilter2),
	}
	p := kio.Pipeline{
		Inputs:  []kio.Reader{input},
		Filters: filters,
		Outputs: []kio.Writer{},
	}

	callback := mockCallback{}
	// setup expectations. `Times` means the function is called no more than `times`.
	callback.On("Callback", mock.Anything).Times(len(filters))

	err := p.ExecuteWithCallback(callback.Callback)

	if !assert.NoError(t, err) {
		assert.FailNow(t, err.Error())
	}

	callback.AssertNumberOfCalls(t, "Callback", len(filters))

	// assert filters are called in the order they are defined.
	for i, filter := range filters {
		assert.Equal(
			t,
			reflect.ValueOf(callback.Calls[i].Arguments[0]).Pointer(),
			reflect.ValueOf(filter).Pointer(),
		)
	}
}

func TestEmptyInput(t *testing.T) {
	actual := &bytes.Buffer{}
	output := kio.ByteWriter{
		Sort:               true,
		WrappingKind:       kio.ResourceListKind,
		WrappingAPIVersion: kio.ResourceListAPIVersion,
	}
	output.Writer = actual

	p := kio.Pipeline{
		Outputs: []kio.Writer{output},
	}

	err := p.Execute()
	if err != nil {
		t.Fatal(err)
	}

	expected := `
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items: []
`

	if !assert.Equal(t,
		strings.TrimSpace(expected), strings.TrimSpace(actual.String())) {
		t.FailNow()
	}
}

func TestEmptyInputWithFilter(t *testing.T) {
	actual := &bytes.Buffer{}
	output := kio.ByteWriter{
		Sort:               true,
		WrappingKind:       kio.ResourceListKind,
		WrappingAPIVersion: kio.ResourceListAPIVersion,
	}
	output.Writer = actual

	filters := []kio.Filter{
		kio.FilterFunc(func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
			nodes = append(nodes, yaml.NewMapRNode(&map[string]string{
				"foo": "bar",
			}))
			return nodes, nil
		}),
		kio.FilterFunc(func(nodes []*yaml.RNode) ([]*yaml.RNode, error) { return nodes, nil }),
	}

	p := kio.Pipeline{
		Outputs: []kio.Writer{output},
		Filters: filters,
	}

	err := p.Execute()
	if err != nil {
		t.Fatal(err)
	}

	expected := `
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items:
- foo: bar
`

	if !assert.Equal(t,
		strings.TrimSpace(expected), strings.TrimSpace(actual.String())) {
		t.FailNow()
	}
}

func TestContinueOnEmptyBehavior(t *testing.T) {
	cases := map[string]struct {
		continueOnEmptyResult bool
		expected              string
	}{
		"quit on empty":     {continueOnEmptyResult: false, expected: ""},
		"continue on empty": {continueOnEmptyResult: true, expected: "foo: bar"},
	}
	for _, tc := range cases {
		actual := &bytes.Buffer{}
		output := kio.ByteWriter{Writer: actual}

		generatorFunc := kio.FilterFunc(func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
			nodes = append(nodes, yaml.NewMapRNode(&map[string]string{
				"foo": "bar",
			}))
			return nodes, nil
		})
		emptyFunc := kio.FilterFunc(func(nodes []*yaml.RNode) ([]*yaml.RNode, error) { return nodes, nil })

		p := kio.Pipeline{
			Outputs:               []kio.Writer{output},
			Filters:               []kio.Filter{emptyFunc, generatorFunc},
			ContinueOnEmptyResult: tc.continueOnEmptyResult,
		}

		err := p.Execute()
		if err != nil {
			t.Fatal(err)
		}

		if !assert.Equal(t,
			tc.expected, strings.TrimSpace(actual.String())) {
			t.Fail()
		}
	}
}

func TestLegacyAnnotationReconciliation(t *testing.T) {
	noopFilter1 := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		return nodes, nil
	}
	noopFilter2 := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		return nodes, nil
	}
	changeInternalAnnos := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		for _, rn := range nodes {
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.PathAnnotation, "new")); err != nil {
				return nil, err
			}
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.IndexAnnotation, "new")); err != nil {
				return nil, err
			}
		}
		return nodes, nil
	}
	changeLegacyAnnos := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		for _, rn := range nodes {
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.LegacyPathAnnotation, "new")); err != nil {
				return nil, err
			}
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.LegacyIndexAnnotation, "new")); err != nil {
				return nil, err
			}
		}
		return nodes, nil
	}
	changeBothPathAnnosMatch := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		for _, rn := range nodes {
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.LegacyPathAnnotation, "new")); err != nil {
				return nil, err
			}
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.PathAnnotation, "new")); err != nil {
				return nil, err
			}
		}
		return nodes, nil
	}
	changeBothPathAnnosMismatch := func(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
		for _, rn := range nodes {
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.LegacyPathAnnotation, "foo")); err != nil {
				return nil, err
			}
			if err := rn.PipeE(yaml.SetAnnotation(kioutil.PathAnnotation, "bar")); err != nil {
				return nil, err
			}
		}
		return nodes, nil
	}

	noops := []kio.Filter{
		kio.FilterFunc(noopFilter1),
		kio.FilterFunc(noopFilter2),
	}
	internal := []kio.Filter{kio.FilterFunc(changeInternalAnnos)}
	legacy := []kio.Filter{kio.FilterFunc(changeLegacyAnnos)}
	changeBothMatch := []kio.Filter{kio.FilterFunc(changeBothPathAnnosMatch), kio.FilterFunc(noopFilter1)}
	changeBothMismatch := []kio.Filter{kio.FilterFunc(changeBothPathAnnosMismatch), kio.FilterFunc(noopFilter1)}

	testCases := map[string]struct {
		input       string
		filters     []kio.Filter
		expected    string
		expectedErr string
	}{
		// the orchestrator should copy the legacy annotations to the new
		// annotations
		"legacy annotations only": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: noops,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should copy the new annotations to the
		// legacy annotations
		"new annotations only": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: noops,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the legacy annotations
		// have been changed by the function
		"change only legacy annotations": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: legacy,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'new'
    config.kubernetes.io/index: 'new'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: 'new'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the new internal annotations
		// have been changed by the function
		"change only internal annotations": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: internal,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "new"
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the legacy annotations
		// have been changed by the function
		"change only internal annotations while input is legacy annotations": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: internal,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'new'
    config.kubernetes.io/index: 'new'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: 'new'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the new internal annotations
		// have been changed by the function
		"change only legacy annotations while input is internal annotations": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: legacy,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "new"
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the legacy annotations
		// have been changed by the function
		"change only legacy annotations while input has both": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: legacy,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'new'
    config.kubernetes.io/index: 'new'
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: 'new'
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the new internal annotations
		// have been changed by the function
		"change only internal annotations while input has both": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '0'
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: internal,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: 'new'
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: 'new'
    internal.config.kubernetes.io/path: "new"
    internal.config.kubernetes.io/index: 'new'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the new internal annotations
		// have been changed by the function
		"change both to matching value while input has both": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '0'
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: changeBothMatch,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: '0'
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: '1'
    internal.config.kubernetes.io/path: "new"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the new internal annotations
		// have been changed by the function
		"change both to matching value while input is legacy": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: changeBothMatch,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "new"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
		},
		// the orchestrator should detect that the new internal annotations
		// have been changed by the function
		"change both to matching value while input is internal": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'configmap.yaml'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters: changeBothMatch,
			expected: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: 'new'
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "new"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
		},
		// the function changes both the legacy and new path annotation, and they mismatch,
		// so we should get an error
		"change both but mismatch while input is legacy": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters:     changeBothMismatch,
			expectedErr: "resource input to function has mismatched legacy and internal path annotations",
		},
		// the function changes both the legacy and new path annotation, and they mismatch,
		// so we should get an error
		"change both but mismatch while input is internal": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters:     changeBothMismatch,
			expectedErr: "resource input to function has mismatched legacy and internal path annotations",
		},
		// the function changes both the legacy and new path annotation, and they mismatch,
		// so we should get an error
		"change both but mismatch while input has both": {
			input: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-from
  annotations:
    config.kubernetes.io/path: 'configmap.yaml'
    config.kubernetes.io/index: '0'
    config.k8s.io/id: '1'
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '0'
data:
  grpcPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ports-to
  annotations:
    config.kubernetes.io/path: "configmap.yaml"
    config.kubernetes.io/index: '1'
    config.k8s.io/id: '2'
    internal.config.kubernetes.io/path: "configmap.yaml"
    internal.config.kubernetes.io/index: '1'
data:
  grpcPort: 8081
`,
			filters:     changeBothMismatch,
			expectedErr: "resource input to function has mismatched legacy and internal path annotations",
		},
	}

	for tn, tc := range testCases {
		t.Run(tn, func(t *testing.T) {
			var out bytes.Buffer
			input := kio.ByteReadWriter{
				Reader:                bytes.NewBufferString(tc.input),
				Writer:                &out,
				OmitReaderAnnotations: true,
				KeepReaderAnnotations: true,
			}
			p := kio.Pipeline{
				Inputs:  []kio.Reader{&input},
				Filters: tc.filters,
				Outputs: []kio.Writer{&input},
			}

			err := p.Execute()
			if tc.expectedErr == "" {
				assert.NoError(t, err)
				assert.Equal(t, tc.expected, out.String())
			} else {
				assert.Error(t, err)
				assert.Equal(t, tc.expectedErr, err.Error())
			}

		})
	}
}
