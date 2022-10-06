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
	"context"
	"reflect"

	"k8s.io/apimachinery/pkg/runtime/schema"
)

func WithContext(ctx context.Context, runner Runner) ResourceListProcessor {
	return runnerProcessor{ctx: ctx, fnRunner: runner}
}

type runnerProcessor struct {
	ctx      context.Context
	fnRunner Runner
}

func (r runnerProcessor) Process(rl *ResourceList) (bool, error) {
	fnCtx := &Context{ctx: r.ctx}
	results := new(Results)
	if ok := r.config(rl.FunctionConfig, results); !ok {
		rl.Results = append(rl.Results, *results...)
		return false, nil
	}
	pass := r.fnRunner.Run(fnCtx, rl.FunctionConfig, rl.Items, results)
	rl.Results = append(rl.Results, *results...)
	return pass, nil
}

func (r *runnerProcessor) config(o *KubeObject, results *Results) bool {
	fnName := reflect.ValueOf(r.fnRunner).Elem().Type().Name()
	switch true {
	case o.IsEmpty():
		results.Infof("`FunctionConfig` is not given")
	case o.IsGroupKind(schema.GroupKind{Kind: "ConfigMap"}):
		data, _, err := o.NestedStringMap("data")
		if err != nil {
			results.ErrorE(err)
			return false
		}
		fnRunnerElem := reflect.ValueOf(r.fnRunner).Elem()
		for i := 0; i < fnRunnerElem.NumField(); i++ {
			if fnRunnerElem.Field(i).Kind() == reflect.Map {
				fnRunnerElem.Field(i).Set(reflect.ValueOf(data))
				break
			}
		}
	case o.IsGroupVersionKind(schema.GroupVersionKind{Group: "fn.kpt.dev", Version: "v1alpha1", Kind: fnName}):
		err := o.As(r.fnRunner)
		if err != nil {
			results.ErrorE(err)
			return false
		}
	default:
		results.Errorf("unknown FunctionConfig `%v`, expect %v", o.GetKind(), fnName)
		return false
	}
	return true
}
