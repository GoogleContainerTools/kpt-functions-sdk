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
	"io"
	"io/ioutil"
	"os"

	"sigs.k8s.io/kustomize/kyaml/errors"
	"sigs.k8s.io/kustomize/kyaml/kio"
)

// AsMain reads the resourceList in yaml format from stdin, evaluates the
// function and write the updated resourceList in yaml to stdout. Errors if any
// will be printed to stderr.
func AsMain(p ResourceListProcessor) error {
	err := func() error {
		in, err := ioutil.ReadAll(os.Stdin)
		if err != nil {
			return fmt.Errorf("unable to read from stdin: %v", err)
		}
		out, err := Run(p, in)
		// If there is an error, we don't return the error immediately.
		// We write out to stdout before returning any error.
		_, outErr := os.Stdout.Write(out)
		if outErr != nil {
			return outErr
		}
		return err
	}()
	return err
}

// Run evaluates the function. input must be a resourceList in yaml format. An
// updated resourceList will be returned.
func Run(p ResourceListProcessor, input []byte) (out []byte, err error) {
	rl, err := ParseResourceList(input)
	if err != nil {
		return nil, err
	}
	defer func() {
		// if we run into a panic, we still need to log the error to Results,
		// and return the ResourceList and error.
		v := recover()
		if v != nil {
			switch t := v.(type) {
			case *ErrKubeObjectFields:
				err = t
			case *ErrSubObjectFields:
				err = t
			default:
				err = fmt.Errorf("panic with %s", v)
			}
			rl.LogResult(err)
			out, _ = rl.ToYAML()
		}
	}()
	success, fnErr := p.Process(rl)
	out, yamlErr := rl.ToYAML()
	if yamlErr != nil {
		return out, yamlErr
	}
	if fnErr != nil {
		return out, fnErr
	}
	if !success {
		return out, fmt.Errorf("error: function failure")
	}
	return out, nil
}

func Execute(p ResourceListProcessor, r io.Reader, w io.Writer) error {
	rw := &byteReadWriter{
		kio.ByteReadWriter{
			Reader:                r,
			Writer:                w,
			KeepReaderAnnotations: true,
		},
	}
	return execute(p, rw)
}

func execute(p ResourceListProcessor, rw *byteReadWriter) error {
	// Read the input
	rl, err := rw.Read()
	if err != nil {
		return errors.WrapPrefixf(err, "failed to read ResourceList input")
	}
	success, fnErr := p.Process(rl)
	// Write the output
	if err := rw.Write(rl); err != nil {
		return errors.WrapPrefixf(err, "failed to write ResourceList output")
	}
	if fnErr != nil {
		return fnErr
	}
	if !success {
		return fmt.Errorf("error: function failure")
	}
	return nil
}
