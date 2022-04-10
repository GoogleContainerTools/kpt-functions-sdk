// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package fn

import (
	"sort"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func generate(t *testing.T) *KubeObject {
	doc := `
apiVersion: v1
kind: ConfigMap
data:
  foo: bar
  foo2: bar2
`

	o, err := ParseKubeObject([]byte(doc))
	if err != nil {
		t.Fatalf("failed to parse object: %v", err)
	}

	return o
}
func TestUpsertMap(t *testing.T) {
	o := generate(t)
	data := o.UpsertMap("data")

	entries, err := data.obj.Entries()
	if err != nil {
		t.Fatalf("entries failed: %v", err)
	}
	var got []string
	for k := range entries {
		got = append(got, k)
	}
	sort.Strings(got)

	want := []string{"foo", "foo2"}
	if diff := cmp.Diff(want, got); diff != "" {
		t.Errorf("Unexpected result (-want, +got): %s", diff)
	}
}

func TestGetMap(t *testing.T) {
	o := generate(t)
	got := o.GetMap("data")
	if got == nil {
		t.Errorf("unexpected value for GetMap(%q); got %v, want non-nil", "data", got)
	}
	got = o.GetMap("notExists")
	if got != nil {
		t.Errorf("unexpected value for GetMap(%q); got %v, want nil", "notExists", got)
	}
}
