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

package io

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"github.com/pkg/errors"
	"gopkg.in/yaml.v2"

	"github.com/GoogleContainerTools/kpt-functions-sdk/ts/go/pkg/framework/types"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Format indicates the representation used for the intermediate data format.
type Format string

// Allowed input formats
const (
	YAML = Format("yaml")
	JSON = Format("json")
)

// These are the magic string constants we use to represent standard input/output/null on any system.
const (
	Stdin  = "/dev/stdin"
	Stdout = "/dev/stdout"
	Null   = "/dev/null"
)

// ReadConfigs reads a JSON file representing a Configs object.
func ReadConfigs(inputFile string, format Format) (types.Configs, error) {
	switch inputFile {
	case Stdin:
		inputFile = os.Stdin.Name()
	case Null:
		return types.Configs(nil), nil
	}

	fileBytes, err := ioutil.ReadFile(inputFile)
	if err != nil {
		return types.Configs(nil), err
	}

	return toConfigs(fileBytes, format)
}

// WriteConfigs writes the Configs object as a JSON file.
//
// outputFile is the path to to the file to be created, it must not exist.
// configs is the list of configs to write to the disk as a Kubernetes List.
func WriteConfigs(outputFile string, configs types.Configs, format Format) error {
	switch outputFile {
	case Stdout:
		outputFile = os.Stdout.Name()
	case Null:
		return nil
	}

	data, err := fromConfigs(configs, format)
	if err != nil {
		return err
	}

	return ioutil.WriteFile(outputFile, data, os.ModePerm)
}

// toConfigs deserializes bytes representing a Configs.
func toConfigs(data []byte, format Format) (types.Configs, error) {
	itemList := types.UnstructuredList{}

	var err error
	switch format {
	case JSON:
		err = json.Unmarshal(data, &itemList)
	case YAML:
		if len(data) > 0 && data[0] == '{' {
			// yaml.Unmarshal doesn't fail on trying to parse JSON, and will happily return *something*. This safeguards
			// against that.
			err = errors.Errorf("tried to parse JSON as YAML. Use --json.")
		} else {
			err = yaml.Unmarshal(data, &itemList)
		}
	default:
		err = errors.Errorf("unrecognized format %s", format)
	}

	if err != nil {
		return nil, errors.Wrapf(err, "failed to deserialize Configs to %s", format)
	}

	result := types.Configs{}
	for _, item := range itemList.Items {
		obj, err2 := toObject(item)
		if err2 != nil {
			return nil, err2
		}
		result = append(result, obj)
	}

	return result, nil
}

// fromConfigs serializes Configs into bytes.
func fromConfigs(configs types.Configs, format Format) ([]byte, error) {
	list := types.UnstructuredList{
		TypeMeta: metav1.TypeMeta{
			Kind:       "List",
			APIVersion: "v1",
		},
	}
	for _, obj := range configs {
		u, err := fromObject(obj)
		if err != nil {
			return nil, err
		}
		list.Items = append(list.Items, *u)
	}

	// Directly using yaml.Marshal on the list ignores **ALL** of the JSON directives, so marshal to JSON first.
	jsn, err := json.MarshalIndent(&list, "", "  ")
	switch format {
	case JSON:
		return jsn, err
	case YAML:
		// Unmarshal into generic map since yaml.Marshal *does* handle fields like we want except for the known issue
		// for 'omitempty' on bare structs.
		m := make(map[string]interface{})
		_ = json.Unmarshal(jsn, &m)
		return yaml.Marshal(m)
	default:
		return nil, errors.Errorf("unrecognized format %+v", format)
	}
}
