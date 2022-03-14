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
