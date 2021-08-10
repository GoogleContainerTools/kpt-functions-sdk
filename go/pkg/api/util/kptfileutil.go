// Copyright 2021 Google LLC
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

package util

import (
	"fmt"
	"strings"

	kptfilev1 "github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/api/kptfile/v1"
	"sigs.k8s.io/kustomize/kyaml/yaml"
)

// ReadKptfile reads a KptFile from a yaml.RNode
func ReadKptfile(node *yaml.RNode) (*kptfilev1.KptFile, error) {
	kpgfile := &kptfilev1.KptFile{}
	s, err := node.String()
	if err != nil {
		return &kptfilev1.KptFile{}, err
	}
	f := strings.NewReader(s)
	d := yaml.NewDecoder(f)
	d.KnownFields(true)
	if err = d.Decode(&kpgfile); err != nil {
		return &kptfilev1.KptFile{}, fmt.Errorf("invalid 'v1' Kptfile: %w", err)
	}
	return kpgfile, nil
}
