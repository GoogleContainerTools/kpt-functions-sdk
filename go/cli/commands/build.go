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

package commands

import (
	"bytes"
	"context"
	"embed"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/heroku/color"
	"github.com/spf13/cobra"
)

//go:embed embed/Dockerfile
var f embed.FS

const (
	ImageTag              = "function:latest"
	DockerfilePath        = "Dockerfile"
	builtinDockerfilePath = "embed/Dockerfile"
)

func NewBuildCmd(ctx context.Context) *cobra.Command {
	r := &BuildRunner{
		ctx: ctx,
	}
	r.Command = &cobra.Command{
		Use:     "build",
		Short:   "build the KRM function as a docker image",
		PreRunE: r.PreRunE,
		RunE:    r.RunE,
	}
	r.Command.Flags().StringVarP(&r.Tag, "tag", "t", ImageTag,
		"the docker image tag")
	r.Command.Flags().StringVarP(&r.DockerfilePath, "file", "f", "",
		"Name of the Dockerfile. If not given, using a default builtin Dockerfile")
	return r.Command
}

type BuildRunner struct {
	ctx     context.Context
	Command *cobra.Command

	Tag            string
	DockerfilePath string
}

func (r *BuildRunner) PreRunE(cmd *cobra.Command, args []string) error {
	if err := r.requireDocker(); err != nil {
		return err
	}
	if !r.dockerfileExist() {
		err := r.createDockerfile()
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *BuildRunner) RunE(cmd *cobra.Command, args []string) error {
	return r.runDockerBuild()
}

func (r *BuildRunner) runDockerBuild() error {
	args := []string{"build", ".", "-f", r.DockerfilePath, "--tag", r.Tag}
	cmd := exec.Command("docker", args...)
	var out, errout bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errout
	err := cmd.Run()
	if err != nil {
		color.Red(strings.TrimSpace(errout.String()))
		return err
	}
	color.Green(out.String())
	color.Green("Image %v builds successfully. Now you can publish the image", r.Tag)
	return nil
}

func (r *BuildRunner) requireDocker() error {
	_, err := exec.LookPath("docker")
	if err != nil {
		return fmt.Errorf("kfn requires that `docker` is installed and on the PATH")
	}
	return nil
}

func (r *BuildRunner) dockerfileExist() bool {
	if r.DockerfilePath == "" {
		r.DockerfilePath = DockerfilePath
	}
	if _, err := os.Stat(r.DockerfilePath); errors.Is(err, os.ErrNotExist) {
		color.Yellow("not find %v, using the builtin default Dockerfile instead...", r.DockerfilePath)
		return false
	}
	return true
}

func (r *BuildRunner) createDockerfile() error {
	dockerfileContent, err := f.ReadFile(builtinDockerfilePath)
	if err != nil {
		return err
	}
	if err := os.WriteFile(DockerfilePath, dockerfileContent, 0644); err != nil {
		return err
	}
	color.Green("created Dockerfile")
	return nil
}
