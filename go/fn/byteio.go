package fn

import (
	"sigs.k8s.io/kustomize/kyaml/errors"
	"sigs.k8s.io/kustomize/kyaml/kio"
	"sigs.k8s.io/kustomize/kyaml/yaml"
)

// byteReadWriter wraps kio.ByteReadWriter
type byteReadWriter struct {
	kio.ByteReadWriter
}

func (rw *byteReadWriter) Read() (*ResourceList, error) {
	nodes, err := rw.ByteReadWriter.Read()
	if err != nil {
		return nil, err
	}
	var items KubeObjects
	for _, n := range nodes {
		obj, err := ParseKubeObject([]byte(n.MustString()))
		if err != nil {
			return nil, err
		}
		items = append(items, obj)
	}
	obj, err := ParseKubeObject([]byte(rw.ByteReadWriter.FunctionConfig.MustString()))
	if err != nil {
		return nil, err
	}
	return &ResourceList{
		Items:          items,
		FunctionConfig: obj,
	}, nil
}

func (rw *byteReadWriter) Write(rl *ResourceList) error {
	if len(rl.Results) > 0 {
		b, err := yaml.Marshal(rl.Results)
		if err != nil {
			return errors.Wrap(err)
		}
		y, err := yaml.Parse(string(b))
		if err != nil {
			return errors.Wrap(err)
		}
		rw.Results = y
	}
	var nodes []*yaml.RNode
	for _, item := range rl.Items {
		node, err := yaml.Parse(item.String())
		if err != nil {
			return err
		}
		nodes = append(nodes, node)
	}
	return rw.ByteReadWriter.Write(nodes)
}
