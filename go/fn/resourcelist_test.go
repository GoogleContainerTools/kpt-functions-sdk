package fn

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

var dupResourceInput = []byte(`
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: example
- apiVersion: v1
  kind: Namespace
  metadata:
    name: example
`)

func TestCheckResourceDuplication(t *testing.T) {
	rl, _ := ParseResourceList(dupResourceInput)
	err := CheckResourceDuplication(rl)
	if err == nil {
		t.Errorf("expect to received duplicate error: got nil")
	}
	expectErr := "duplicate Resource(apiVersion=v1, kind=Namespace, Namespace=, Name=example)"
	if err.Error() != expectErr {
		t.Errorf("expect CheckResourceDuplication to fail; got %v, want %v", err, expectErr)
	}
}

func TestParseResourceListResults(t *testing.T) {
	rl, err := ParseResourceList([]byte(`
apiVersion: config.kubernetes.io/v1
kind: ResourceList
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: example
results:
- message: foo
  severity: error
- message: bar
  severity: warning
`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := Results{
		{
			Message:  "foo",
			Severity: Error,
		},
		{
			Message:  "bar",
			Severity: Warning,
		},
	}
	if !cmp.Equal(expected, rl.Results) {
		t.Fatalf("unexpected diff: %v", cmp.Diff(expected, rl.Results))
	}
}
