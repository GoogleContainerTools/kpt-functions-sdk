package fn

import "testing"

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
