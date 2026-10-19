// Copyright 2026 The kpt Authors
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

package docs

import (
	"reflect"

	"github.com/leanovate/gopter"
	"github.com/leanovate/gopter/gen"
)

// genBoundedSlice generates a slice of string elements whose length is between
// minLen and maxLen (inclusive). It mirrors rapid.SliceOfN(elem, minLen, maxLen)
// for the string element generators used by these property tests.
func genBoundedSlice(elem gopter.Gen, minLen, maxLen int) gopter.Gen {
	stringSliceType := reflect.TypeFor[[]string]()
	return gen.IntRange(minLen, maxLen).FlatMap(func(n any) gopter.Gen {
		return gen.SliceOfN(n.(int), elem)
	}, stringSliceType)
}
