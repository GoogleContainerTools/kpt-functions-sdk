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

package swagger

// Empty represents a type for which we have no type information.
type Empty struct{}

var _ Type = Empty{}

// Imports implements Type.
func (Empty) Imports() []Ref {
	return nil
}

// NestedTypes implements Type.
func (Empty) NestedTypes() []Object {
	return nil
}
