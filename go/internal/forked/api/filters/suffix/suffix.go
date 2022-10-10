// Copyright 2021 The Kubernetes Authors.
// SPDX-License-Identifier: Apache-2.0

package suffix

import (
	"fmt"

	"sigs.k8s.io/kustomize/api/filters/fieldspec"
	"sigs.k8s.io/kustomize/api/filters/filtersutil"
	"sigs.k8s.io/kustomize/api/types"
	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn/internal/forked/kyaml/kio"
	"github.com/GoogleContainerTools/kpt-functions-sdk/krmfn/internal/forked/kyaml/yaml"
)

// Filter applies resource name suffix's using the fieldSpecs
type Filter struct {
	Suffix string `json:"suffix,omitempty" yaml:"suffix,omitempty"`

	FieldSpec types.FieldSpec `json:"fieldSpec,omitempty" yaml:"fieldSpec,omitempty"`
}

var _ kio.Filter = Filter{}

func (f Filter) Filter(nodes []*yaml.RNode) ([]*yaml.RNode, error) {
	return kio.FilterAll(yaml.FilterFunc(f.run)).Filter(nodes)
}

func (f Filter) run(node *yaml.RNode) (*yaml.RNode, error) {
	err := node.PipeE(fieldspec.Filter{
		FieldSpec:  f.FieldSpec,
		SetValue:   f.evaluateField,
		CreateKind: yaml.ScalarNode, // Name is a ScalarNode
		CreateTag:  yaml.NodeTagString,
	})
	return node, err
}

func (f Filter) evaluateField(node *yaml.RNode) error {
	return filtersutil.SetScalar(fmt.Sprintf(
		"%s%s", node.YNode().Value, f.Suffix))(node)
}