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
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn/internal"
)

// SubObject represents a map within a KubernetesObject
type SubObject struct {
	obj *internal.MapVariant
}

func (o *SubObject) UpsertMap(k string) *SubObject {
	m := o.obj.UpsertMap(k)
	return &SubObject{obj: m}
}

func (o *SubObject) GetMap(k string) *SubObject {
	m := o.obj.GetMap(k)
	if m == nil {
		return nil
	}
	return &SubObject{obj: m}
}
