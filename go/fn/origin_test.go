// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package fn

import (
	"testing"
)

var resource = []byte(`
apiVersion: v1
kind: ConfigMap
metadata:
  name: cm
  annotations:
    internal.kpt.dev/upstream-identifier: '|ConfigMap|example|example'
`)

var resourceCustom = []byte(`
apiVersion: test.kpt.dev/v1
kind: Custom
metadata:
  name: cm
`)

func TestOrigin(t *testing.T) {
	noGroup, _ := ParseKubeObject(resource)

	if id, _ := noGroup.GetOriginId(); id.String() != "|ConfigMap|example|example" {
		t.Fatalf("GetOriginId() expect %v, got %v", "|ConfigMap|example|example", id)
	}
	defaultNamespace, _ := ParseKubeObject(resource)
	if defaultNamespace.GetId().String() != "|ConfigMap|default|cm" {
		t.Fatalf("GetId() expect %v, got %v", "|ConfigMap|default|cm", defaultNamespace.GetId())
	}
	sameIdAndOrigin, _ := ParseKubeObject(resourceCustom)
	if id, _ := sameIdAndOrigin.GetOriginId(); id.String() != sameIdAndOrigin.GetId().String() {
		t.Fatalf("expect the origin and id the same if upstream-identifier is not given, got OriginID %v, got ID %v",
			id, sameIdAndOrigin.GetId())
	}
	unknownNamespace, _ := ParseKubeObject(resourceCustom)
	if unknownNamespace.GetId().Namespace != UnknownNamespace {
		t.Fatalf("expect unknown custom resource use namespace %v, got %v",
			UnknownNamespace, unknownNamespace.GetId().Namespace)
	}
}
