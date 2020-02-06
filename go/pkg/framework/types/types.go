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

package types

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

// KubernetesObject represents a single Kubernetes object.
type KubernetesObject interface {
	metav1.Object
	GroupVersionKind() schema.GroupVersionKind
}

// Configs is a list of Kubernetes objects used as the standard message format between kpt
// functions.
type Configs []KubernetesObject

// ConfigFunc is a type of kpt function that consumes Configs and potentially mutates it.
type ConfigFunc func(configs *Configs) error

// ConfigError represents a non-exceptional issue with configuration.
//
// For operational errors such as IO operation failures, throw errors instead of returning a ConfigError.
type ConfigError struct {
	error
}

// Unstructured is a pared-down version of unstructured.Unstructured in k8s.io/apimachinery.
//
// Use framework.Register to register types with the parser to get a typesafe experience rather
// than manipulating this directly.
type Unstructured struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	// Object holds all non-meta fields in a JSON-compatible map.
	//
	// Behavior when adding "kind", "apiVersion", and "metadata" fields to Object is undefined.
	Object map[string]interface{} `json:"-"` // handled by Unstructured.MarshalJSON
}

// UnstructuredList holds a list of Unstructureds.
type UnstructuredList struct {
	metav1.TypeMeta  `json:",inline"`
	*metav1.ListMeta `json:"metadata,omitempty"`

	Items []Unstructured `json:"items,omitempty"`
}
