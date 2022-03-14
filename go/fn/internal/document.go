package internal

import (
	"bytes"
	"io"

	"sigs.k8s.io/kustomize/kyaml/yaml"
)

type doc struct {
	nodes []*yaml.Node
}

func NewDoc(nodes ...*yaml.Node) *doc {
	return &doc{nodes: nodes}
}

func ParseDoc(b []byte) (*doc, error) {
	br := bytes.NewReader(b)

	var nodes []*yaml.Node
	decoder := yaml.NewDecoder(br)
	for {
		node := &yaml.Node{}
		if err := decoder.Decode(node); err != nil {
			if err == io.EOF {
				break
			}
			return nil, err
		}
		nodes = append(nodes, node)
	}

	return &doc{nodes: nodes}, nil
}

func (d *doc) ToYAML() ([]byte, error) {
	var w bytes.Buffer
	encoder := yaml.NewEncoder(&w)
	for _, node := range d.nodes {
		if node.Kind == yaml.DocumentNode {
			if len(node.Content) == 0 {
				// These cause errors when we try to write them
				continue
			}
		}
		if err := encoder.Encode(node); err != nil {
			return nil, err
		}
	}

	return w.Bytes(), nil
}

func (d *doc) Objects() ([]*MapVariant, error) {
	return extractObjects(d.nodes...)
}
