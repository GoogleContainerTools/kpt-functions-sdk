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
	"log"
	"strings"
)

// ErrMissingFnConfig raises error if a required functionConfig is missing.
type ErrMissingFnConfig struct{}

func (ErrMissingFnConfig) Error() string {
	return "unable to find the functionConfig in the resourceList"
}

// ErrOpOrDie raises if the KubeObject operation panics.
type ErrOpOrDie struct {
	obj    *KubeObject
	fields []string
}

func (e *ErrOpOrDie) Error() string {
	return fmt.Sprintf("Resource(apiVersion=%v, kind=%v, Name=%v) has unmatched field type: `%v",
		e.obj.GetAPIVersion(), e.obj.GetKind(), e.obj.GetName(), strings.Join(e.fields, "/"))
}

type MetaType int

const (
	ApiVersion  MetaType = 1
	Kind        MetaType = 2
	Name        MetaType = 3
	Namespace   MetaType = 4
	Labels      MetaType = 5
	Annotations MetaType = 6
)

// ErrOpOrDie raises if the KubeObject operation panics.
type MetaTypeError struct {
	metaType   MetaType
	label      string
	annotation string
}

func (e *MetaTypeError) Error() string {
	var attempts []string
	switch e.metaType {
	case ApiVersion:
		attempts = []string{"apiVersion"}
	case Kind:
		attempts = []string{"kind"}
	case Name:
		attempts = []string{"metadata.name", "name"}
	case Namespace:
		attempts = []string{"metadata.namespace", "namespace"}
	case Labels:
		if e.label != "" {
			attempts = []string{fmt.Sprintf("metadata.labels[].%v", e.label)}
		} else {
			attempts = []string{"metadata.labels"}
		}
	case Annotations:
		if e.annotation != "" {
			attempts = []string{fmt.Sprintf("metadata.annotations[].%v", e.annotation)}
		} else {
			attempts = []string{"metadata.annotations"}
		}
	}
	return fmt.Sprintf("cannot find KubeObject `%v`, tried paths: %v",
		e.metaType, strings.Join(attempts, ","))
}

func handleOptOrDieErr() {
	if v := recover(); v != nil {
		if eOp, ok := v.(ErrOpOrDie); ok {
			log.Fatalf(eOp.Error())
		} else if eMeta, ok := v.(MetaTypeError); ok {
			log.Fatalf(eMeta.Error())
		} else {
			panic(v)
		}
	}
}
