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

package fn

import (
	"fmt"
	"io/ioutil"
	"os"
)

// AsMain reads the resourceList in yaml format from stdin, evaluates the
// function and write the updated resourceList in yaml to stdout. Errors if any
// will be printed to stderr.
func AsMain(p ResourceListProcessor) error {
	in, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		return fmt.Errorf("unable to read from stdin: %v", err)
	}
	out, err := Run(p, in)
	if err != nil {
		return err
	}
	_, err = os.Stdout.Write(out)
	return err
}

// Run evaluates the function. input must be a resourceList in yaml format. An
// updated resourceList will be returned.
func Run(p ResourceListProcessor, input []byte) ([]byte, error) {
	rl, err := ParseResourceList(input)
	if err != nil {
		return nil, err
	}
	defer handleOptOrDieErr()
	err = p.Process(rl)
	if err != nil {
		// If the error is not a Results type, we wrap the error as a Result.
		if results, ok := err.(Results); ok {
			rl.Results = append(rl.Results, results...)
		} else if result, ok := err.(Result); ok {
			rl.Results = append(rl.Results, &result)
		} else if result, ok := err.(*Result); ok {
			rl.Results = append(rl.Results, result)
		} else {
			rl.Results = append(rl.Results, ErrorResult(err))
		}
	}
	return rl.ToYAML()
}
