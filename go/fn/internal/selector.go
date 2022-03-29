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
package internal

import (
	"strings"
)

const equalDelimiter = "="

func IsEqualSelector(field string) bool{
	if strings.Contains(field, equalDelimiter) {
		return true
	}
	// TODO: extend and support multi "equal" syntax. e.g. `kind=Project,name=kit`
	return false
}

func GetEqualSelector(field string) (string, string){
	segments := strings.Split(field, equalDelimiter)
	if len(segments) != 2 {
		panic(ErrEqualSelector{expected: "YOUR_KEY=YOUR_VALUE", actual: field})
	}
	return segments[0], segments[1]
}

