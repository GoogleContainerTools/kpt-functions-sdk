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

package runners

import (
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/framework/io"
	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/framework/types"
	"github.com/spf13/cobra"
)

const (
	inputFlag  = "input"
	outputFlag = "output"
	jsonFlag   = "json"
)

var (
	input   string
	output  string
	useJSON bool
)

func addInputFlag(cmd *cobra.Command) {
	cmd.Flags().StringVar(&input, inputFlag, io.Stdin,
		`Path to the input JSON file`)
}

func addOutputFlag(cmd *cobra.Command) {
	cmd.Flags().StringVar(&output, outputFlag, io.Stdout,
		`Path to the output JSON file`)
}

func addFormatFlag(cmd *cobra.Command) {
	cmd.Flags().BoolVar(&useJSON, jsonFlag, false,
		`input and output is JSON instead of YAML`)
}

func addProps(cmd *cobra.Command, propNames []string) types.Props {
	props := types.Props{}
	for _, propName := range propNames {
		empty := ""
		props[propName] = &empty
		cmd.Flags().StringVar(props[propName], propName, "", "")
	}
	return props
}

func getFormat() io.Format {
	if useJSON {
		return io.JSON
	}
	return io.YAML
}

// RunFunc runs a ConfigFunc with the specified property names.
func RunFunc(f types.ConfigFunc, propNames ...string) {
	cmd := &cobra.Command{}
	//TODO(b/138231979): Make text output match more closely with go vs typescript.

	addInputFlag(cmd)
	addOutputFlag(cmd)
	addFormatFlag(cmd)
	props := addProps(cmd, propNames)

	cmd.RunE = func(cmd *cobra.Command, args []string) error {
		// Since printing the usage message since we know all required fields are present.
		cmd.SilenceUsage = true

		configs, err := io.ReadConfigs(input, getFormat())
		if err != nil {
			return err
		}

		err = f(&configs, props)
		if err != nil {
			return err
		}

		return io.WriteConfigs(output, configs, getFormat())
	}

	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
	os.Exit(0)
}
