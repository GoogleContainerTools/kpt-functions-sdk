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

package main

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/swagger/language"

	"github.com/pkg/errors"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/pkg/swagger"
	"github.com/spf13/cobra"
)

var filters []string

func init() {
	mainCmd.Flags().StringSliceVar(&filters, "definitions", []string{"*"},
		`Comma-delimited list of swagger Definitions to generate types for. Includes transitive dependencies.
Defaults to all Definitions if unset. Use '*' for wildcard.`)
}

var mainCmd = &cobra.Command{
	Use:  "typegen [SWAGGER_PATH] [OUTPUT_PATH]",
	Long: "Generate TypeScript types from a swagger.json.",
	Args: cobra.ExactArgs(2),
	RunE: func(cmd *cobra.Command, args []string) error {
		swaggerPath := args[0]
		bytes, err := ioutil.ReadFile(swaggerPath)
		if err != nil {
			return errors.Wrap(err, "unable to find Swagger file")
		}

		var swaggerMap map[string]interface{}
		err = json.Unmarshal(bytes, &swaggerMap)
		if err != nil {
			return errors.Wrap(err, "unable to parse Swagger file as JSON")
		}

		definitions, refMap := swagger.ParseSwagger(swaggerMap)
		outPath := args[1]

		err = os.MkdirAll(outPath, os.ModePerm)
		if err != nil {
			return err
		}

		return printTS(outPath, refMap, definitions)
	},
}

func printTS(outPath string, refObjects map[swagger.Ref]swagger.Object, definitions []swagger.Definition) error {
	pkgs := make(map[string][]swagger.Definition)
	for _, definition := range definitions {
		pkg := definition.Meta().Package
		pkgs[pkg] = append(pkgs[pkg], definition)
	}

	pkgs = swagger.FilterDefinitions(filters, pkgs)

	lang := language.TypeScript{
		RefObjects: refObjects,
	}
	for pkg, defs := range pkgs {
		var contents []string
		header := lang.PrintHeader(defs)
		if header != "" {
			contents = append(contents, header)
		}
		sort.Slice(defs, func(i, j int) bool {
			return swagger.FullName(defs[i]) < swagger.FullName(defs[j])
		})
		for _, definition := range defs {
			contents = append(contents, lang.PrintDefinition(definition))
		}

		err := ioutil.WriteFile(filepath.Join(outPath, pkg+".ts"), []byte(strings.Join(contents, "\n\n")), 0644)
		if err != nil {
			return err
		}
	}

	return nil
}

func main() {
	err := mainCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}
