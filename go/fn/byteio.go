package fn

import (
	"sigs.k8s.io/kustomize/kyaml/kio"
	"sigs.k8s.io/kustomize/kyaml/yaml"
)

// byteReadWriter wraps kio.ByteReadWriter
type byteReadWriter struct {
	kio.ByteReadWriter
}

func (rw *byteReadWriter) Read() (KubeObjects, *KubeObject, error) {
	items, err := rw.ByteReadWriter.Read()
	if err != nil {
		return nil, nil, err
	}
	var result KubeObjects
	for _, item := range items {
		obj, err := ParseKubeObject([]byte(item.MustString()))
		if err != nil {
			return nil, nil, err
		}
		result = append(result, obj)
	}
	obj, err := ParseKubeObject([]byte(rw.ByteReadWriter.FunctionConfig.MustString()))
	if err != nil {
		return nil, nil, err
	}

	return result, obj, nil
}

func (rw *byteReadWriter) Write(objs KubeObjects) error {
	var nodes []*yaml.RNode
	for _, item := range objs {
		node, err := yaml.Parse(item.String())
		if err != nil {
			return err
		}
		nodes = append(nodes, node)
	}
	return rw.ByteReadWriter.Write(nodes)
}
