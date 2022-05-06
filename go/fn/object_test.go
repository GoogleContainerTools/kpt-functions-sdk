package fn

import (
	"testing"
)

func TestIsNamespaceScoped(t *testing.T) {
	testdata := map[string]struct{
		input []byte
		expected bool
 	}{
		"k8s resource, namespace scoped but unset": {
			input: []byte(`
apiVersion: v1
kind: ResourceQuota
metadata:
  name: example
spec:
  hard:
    limits.cpu: '10'
`),
			expected: true,
		},
		"k8s resource, cluster scoped": {
			input: []byte(`
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata: 
  name: example
subjects:
- kind: ServiceAccount
  name: example
  apiGroup: rbac.authorization.k8s.io
`),
			expected: false,
		},
		"custom resource, namespace set": {
			input: []byte(`
apiVersion: kpt-test
kind: KptTestResource
metadata: 
  name: example
  namespace: example
`),
			expected: true,
		},
		"custom resource, namespace unset": {
			input: []byte(`
apiVersion: kpt-test
kind: KptTestResource
metadata: 
  name: example
`),
			expected: false,
		},
	}
	for description, data := range testdata {
		o, _ := ParseKubeObject(data.input)
		if o.IsNamespaceScoped() != data.expected {
			t.Errorf("%v failed, resource namespace scope: got %v, want  %v", description, o.IsNamespaceScoped(), data.expected)
		}
	}
}

var noFnConfigResourceList = []byte(`apiVersion: config.kubernetes.io/v1
kind: ResourceList
`)
func TestNilFnConfigResourceList(t *testing.T) {
	rl, _ := ParseResourceList(noFnConfigResourceList)
	if rl.FunctionConfig == nil	{
		t.Errorf("Empty functionConfig in ResourceList should still be initialized to avoid nil pointer error")
	}
	if !rl.FunctionConfig.IsEmpty() {
		t.Errorf("The dummy fnConfig should be surfaced and checkable.")
	}
	// Check that FunctionConfig should be able to call KRM methods even if its Nil"
	{
		if rl.FunctionConfig.GetKind() != "" {
			t.Errorf("Nil KubeObject cannot call GetKind()")
		}
		if rl.FunctionConfig.GetAPIVersion() != "" {
			t.Errorf("Nil KubeObject cannot call GetAPIVersion()")
		}
		if rl.FunctionConfig.GetName() != "" {
			t.Errorf("Nil KubeObject cannot call GetName()")
		}
		if rl.FunctionConfig.GetNamespace() != "" {
			t.Errorf("Nil KubeObject cannot call GetNamespace()")
		}
		if rl.FunctionConfig.GetAnnotation("X") != "" {
			t.Errorf("Nil KubeObject cannot call GetAnnotation()")
		}
		if rl.FunctionConfig.GetLabel("Y") != "" {
			t.Errorf("Nil KubeObject cannot call GetLabel()")
		}
	}
	// Check that nil FunctionConfig can use SubObject methods.
	{
		_, found, err := rl.FunctionConfig.NestedString("not-exist")
		if found || err != nil {
			t.Errorf("Nil KubeObject shall not have the field path `not-exist` exist, and not expect errors")
		}
	}
	// Check that nil FunctionConfig should be editable.
	{
		rl.FunctionConfig.SetKind("CustomFn")
		if rl.FunctionConfig.GetKind() != "CustomFn" {
			t.Errorf("Nil KubeObject cannot call SetKind()")
		}
		rl.FunctionConfig.SetAPIVersion("kpt.fn/v1")
		if rl.FunctionConfig.GetAPIVersion() != "kpt.fn/v1" {
			t.Errorf("Nil KubeObject cannot call SetAPIVersion()")
		}
		rl.FunctionConfig.SetName("test")
		if rl.FunctionConfig.GetName() != "test" {
			t.Errorf("Nil KubeObject cannot call SetName()")
		}
		rl.FunctionConfig.SetNamespace("test-ns")
		if rl.FunctionConfig.GetNamespace() != "test-ns" {
			t.Errorf("Nil KubeObject cannot call SetNamespace()")
		}
		rl.FunctionConfig.SetAnnotation("k", "v")
		if rl.FunctionConfig.GetAnnotation("k") != "v" {
			t.Errorf("Nil KubeObject cannot call SetAnnotation()")
		}
		rl.FunctionConfig.SetLabel("k", "v")
		if rl.FunctionConfig.GetLabel("k") != "v" {
			t.Errorf("Nil KubeObject cannot call SetLabel()")
		}
		if rl.FunctionConfig.IsEmpty() {
			t.Errorf("The modified fnConfig is not nil.")
		}
	}
}