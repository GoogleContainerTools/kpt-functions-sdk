// Copyright 2019 Google LLC
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

import (
	"encoding/json"
	"io/ioutil"
	"testing"
)

func TestSwagger(t *testing.T) {
	// Ensures real Swagger definitions are actually parseable. Will be updated as type generation is made more
	// sophisticated.
	testCases := []struct {
		name string
		path string
	}{
		{
			name: "1.13.0",
			path: "testdata/swagger-v1.13.0.json",
		},
		{
			name: "1.14.3",
			path: "testdata/swagger-v1.14.3.json",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			bytes, err := ioutil.ReadFile(tc.path)
			if err != nil {
				t.Fatal(err)
			}

			var swagger map[string]interface{}
			err = json.Unmarshal(bytes, &swagger)
			if err != nil {
				t.Fatal(err)
			}

			ParseSwagger(swagger)
		})
	}
}
