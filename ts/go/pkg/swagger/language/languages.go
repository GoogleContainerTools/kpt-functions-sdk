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

package language

import "github.com/GoogleContainerTools/kpt-functions-sdk/ts/go/pkg/swagger"

// Language implements the minimum required to print client code for a Definition in a particular programming language.
//
// Implementors of Language must satisfy the following properties:
//
// 1) The order Definitions are printed in a file MUST have no impact on whether code compiles/works.
//
type Language interface {
	// File returns the relative path to definition's client code.
	File(definition swagger.Definition) string

	// PrintHeaderComment prints the top-level comment block.
	PrintHeaderComment() string

	// PrintHeader prints everything appearing before any Definitions, such as import statements.
	//
	// definitions is the set of Definitions to be printed in the current file.
	PrintHeader(definitions []swagger.Definition) string

	// PrintDefinition prints a single definition.
	PrintDefinition(definition swagger.Definition) string
}
