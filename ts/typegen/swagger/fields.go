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

import "fmt"

func getString(key string, o map[string]interface{}) (string, bool) {
	v, hasKey := o[key]
	if !hasKey {
		return "", false
	}
	s, isString := v.(string)
	if !isString {
		panic(fmt.Sprintf("%s must be a string: %+v", key, o))
	}
	return s, true
}

func getRequiredString(key string, o map[string]interface{}) string {
	s, hasKey := getString(key, o)
	if !hasKey {
		panic(fmt.Sprintf("missing required field %s: %+v", key, o))
	}
	return s
}

func getStringArray(key string, o map[string]interface{}) ([]string, bool) {
	v, hasKey := o[key]
	if !hasKey {
		return nil, false
	}
	array, isArray := v.([]interface{})
	if !isArray {
		panic(fmt.Sprintf("%s must be an array: %+o", key, v))
	}

	var stringArray []string
	for _, e := range array {
		s, isString := e.(string)
		if !isString {
			panic(fmt.Sprintf("%s must be an array of strings: %+o", key, e))
		}
		stringArray = append(stringArray, s)
	}

	return stringArray, true
}

func getMap(key string, o map[string]interface{}) (map[string]interface{}, bool) {
	v, hasKey := o[key]
	if !hasKey {
		return nil, false
	}

	m, isMap := v.(map[string]interface{})
	if !isMap {
		panic(fmt.Sprintf("%s must be a map: %+v", key, o))
	}
	return m, true
}

func getRequiredMap(key string, o map[string]interface{}) map[string]interface{} {
	m, hasKey := getMap(key, o)
	if !hasKey {
		panic(fmt.Sprintf("missing required field %s: %+v", key, o))
	}
	return m
}
