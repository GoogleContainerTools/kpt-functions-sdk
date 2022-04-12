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
	"reflect"
	"strconv"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn/internal"
	"sigs.k8s.io/kustomize/kyaml/kio/kioutil"
	"sigs.k8s.io/kustomize/kyaml/yaml"
)

// KubeObject presents a k8s object.
type KubeObject struct {
	SubObject
}

// ParseKubeObject parses input byte slice to a KubeObject.
func ParseKubeObject(in []byte) (*KubeObject, error) {
	doc, err := internal.ParseDoc(in)
	if err != nil {
		return nil, fmt.Errorf("failed to parse input bytes: %w", err)
	}
	objects, err := doc.Elements()
	if err != nil {
		return nil, fmt.Errorf("failed to extract objects: %w", err)
	}
	if len(objects) != 1 {
		return nil, fmt.Errorf("expected exactly one object, got %d", len(objects))
	}
	rlMap := objects[0]
	return asKubeObject(rlMap), nil
}

// GetOrDie gets the value for a nested field located by fields. A pointer must
// be passed in, and the value will be stored in ptr. If the field doesn't
// exist, the ptr will be set to nil. It will panic if it encounters any error.
func (o *KubeObject) GetOrDie(ptr interface{}, fields ...string) {
	_, err := o.Get(ptr, fields...)
	if err != nil {
		panic(ErrKubeObjectFields{obj: o, fields: fields})
	}
}

// GetString returns the string value, if the field exist and a potential error.
func (o *SubObject) GetString(fields ...string) (string, bool, error) {
	var val string
	found, err := o.Get(&val, fields...)
	return val, found, err
}

// GetStringOrDie returns the string value at fields. An empty string will be
// returned if the field is not found. It will panic if encountering any errors.
func (o *KubeObject) GetStringOrDie(fields ...string) string {
	val, _, err := o.GetString(fields...)
	if err != nil {
		panic(ErrKubeObjectFields{obj: o, fields: fields})
	}
	return val
}

// GetInt returns the string value, if the field exist and a potential error.
func (o *KubeObject) GetInt(fields ...string) (int, bool, error) {
	var val int
	found, err := o.Get(&val, fields...)
	return val, found, err
}

// GetIntOrDie returns the string value at fields. An empty string will be
// returned if the field is not found. It will panic if encountering any errors.
func (o *KubeObject) GetIntOrDie(fields ...string) int {
	val, _, err := o.GetInt(fields...)
	if err != nil {
		panic(ErrKubeObjectFields{obj: o, fields: fields})
	}
	return val
}

// Get gets the value for a nested field located by fields. A pointer must be
// passed in, and the value will be stored in ptr. ptr can be a concrete type
// (e.g. string, []corev1.Container, []string, corev1.Pod, map[string]string) or
// a yaml.RNode. yaml.RNode should be used if you are dealing with comments that
// is more than what LineComment, HeadComment, SetLineComment and
// SetHeadComment can handle. It returns if the field is found and a
// potential error.
func (o *SubObject) Get(ptr interface{}, fields ...string) (bool, error) {
	found, err := func() (bool, error) {
		if o == nil {
			return false, fmt.Errorf("the object doesn't exist")
		}
		if ptr == nil || reflect.ValueOf(ptr).Kind() != reflect.Ptr {
			return false, fmt.Errorf("ptr must be a pointer to an object")
		}

		if rn, ok := ptr.(*yaml.RNode); ok {
			val, found, err := o.obj.GetNestedValue(fields...)
			if err != nil || !found {
				return found, err
			}
			rn.SetYNode(val.Node())
			return found, err
		}

		switch k := reflect.TypeOf(ptr).Elem().Kind(); k {
		case reflect.Struct, reflect.Map:
			m, found, err := o.obj.GetNestedMap(fields...)
			if err != nil || !found {
				return found, err
			}
			err = m.Node().Decode(ptr)
			return found, err
		case reflect.Slice:
			s, found, err := o.obj.GetNestedSlice(fields...)
			if err != nil || !found {
				return found, err
			}
			err = s.Node().Decode(ptr)
			return found, err
		case reflect.String:
			s, found, err := o.obj.GetNestedString(fields...)
			if err != nil || !found {
				return found, err
			}
			*(ptr.(*string)) = s
			return found, nil
		case reflect.Int, reflect.Int64:
			i, found, err := o.obj.GetNestedInt(fields...)
			if err != nil || !found {
				return found, err
			}
			if k == reflect.Int {
				*(ptr.(*int)) = i
			} else if k == reflect.Int64 {
				*(ptr.(*int64)) = int64(i)
			}
			return found, nil
		case reflect.Float64:
			f, found, err := o.obj.GetNestedFloat(fields...)
			if err != nil || !found {
				return found, err
			}
			*(ptr.(*float64)) = f
			return found, nil
		case reflect.Bool:
			b, found, err := o.obj.GetNestedBool(fields...)
			if err != nil || !found {
				return found, err
			}
			*(ptr.(*bool)) = b
			return found, nil
		default:
			return false, fmt.Errorf("unhandled kind %s", k)
		}
	}()
	if err != nil {
		return found, fmt.Errorf("unable to get fields %v as %T with error: %w", fields, ptr, err)
	}
	return found, nil
}

// LineComment returns the line comment, if the target field exist and a
// potential error.
func (o *KubeObject) LineComment(fields ...string) (string, bool, error) {
	rn := &yaml.RNode{}
	found, err := o.Get(rn, fields...)
	if !found || err != nil {
		return "", found, err
	}
	return rn.YNode().LineComment, true, nil
}

// HeadComment returns the head comment, if the target field exist and a
// potential error.
func (o *KubeObject) HeadComment(fields ...string) (string, bool, error) {
	rn := &yaml.RNode{}
	found, err := o.Get(rn, fields...)
	if !found || err != nil {
		return "", found, err
	}
	return rn.YNode().HeadComment, true, nil
}

// SetOrDie sets a nested field located by fields to the value provided as val.
// It will panic if it encounters any error.
func (o *KubeObject) SetOrDie(val interface{}, fields ...string) {
	if err := o.Set(val, fields...); err != nil {
		panic(ErrKubeObjectFields{obj: o, fields: fields})
	}
}

// Set sets a nested field located by fields to the value provided as val. val
// should not be a yaml.RNode. If you want to deal with yaml.RNode, you should
// use Get method and modify the underlying yaml.Node.
func (o *SubObject) Set(val interface{}, fields ...string) error {
	err := func() error {
		if o == nil {
			return fmt.Errorf("the object doesn't exist")
		}
		if val == nil {
			return fmt.Errorf("the passed-in object must not be nil")
		}
		kind := reflect.ValueOf(val).Kind()
		if kind == reflect.Ptr {
			kind = reflect.TypeOf(val).Elem().Kind()
		}

		switch kind {
		case reflect.Struct, reflect.Map:
			m, err := internal.TypedObjectToMapVariant(val)
			if err != nil {
				return err
			}
			return o.obj.SetNestedMap(m, fields...)
		case reflect.Slice:
			s, err := internal.TypedObjectToSliceVariant(val)
			if err != nil {
				return err
			}
			return o.obj.SetNestedSlice(s, fields...)
		case reflect.String:
			var s string
			switch val := val.(type) {
			case string:
				s = val
			case *string:
				s = *val
			}
			return o.obj.SetNestedString(s, fields...)
		case reflect.Int, reflect.Int64:
			var i int
			switch val := val.(type) {
			case int:
				i = val
			case *int:
				i = *val
			case int64:
				i = int(val)
			case *int64:
				i = int(*val)
			}
			return o.obj.SetNestedInt(i, fields...)
		case reflect.Float64:
			var f float64
			switch val := val.(type) {
			case float64:
				f = val
			case *float64:
				f = *val
			}
			return o.obj.SetNestedFloat(f, fields...)
		case reflect.Bool:
			var b bool
			switch val := val.(type) {
			case bool:
				b = val
			case *bool:
				b = *val
			}
			return o.obj.SetNestedBool(b, fields...)
		default:
			return fmt.Errorf("unhandled kind %s", kind)
		}
	}()
	if err != nil {
		return fmt.Errorf("unable to set %v at fields %v with error: %w", val, fields, err)
	}
	return nil
}

func (o *KubeObject) SetLineComment(comment string, fields ...string) error {
	rn := &yaml.RNode{}
	found, err := o.Get(rn, fields...)
	if err != nil {
		return err
	}
	if !found {
		return fmt.Errorf("can't set line comment because the field doesn't exist")
	}
	rn.YNode().LineComment = comment
	return nil
}

func (o *KubeObject) SetHeadComment(comment string, fields ...string) error {
	rn := &yaml.RNode{}
	found, err := o.Get(rn, fields...)
	if err != nil {
		return err
	}
	if !found {
		return fmt.Errorf("can't set head comment because the field doesn't exist")
	}
	rn.YNode().HeadComment = comment
	return nil
}

// RemoveOrDie removes the field located by fields if found. It will panic if it
// encounters any error.
func (o *KubeObject) RemoveOrDie(fields ...string) {
	if _, err := o.Remove(fields...); err != nil {
		panic(ErrKubeObjectFields{obj: o, fields: fields})
	}
}

// Remove removes the field located by fields if found. It returns if the field
// is found and a potential error.
func (o *KubeObject) Remove(fields ...string) (bool, error) {
	found, err := func() (bool, error) {
		if o == nil {
			return false, fmt.Errorf("the object doesn't exist")
		}
		return o.obj.RemoveNestedField(fields...)
	}()
	if err != nil {
		return found, fmt.Errorf("unable to remove fields %v with error: %w", fields, err)
	}
	return found, nil
}

// AsOrDie converts a KubeObject to the desired typed object. ptr must
// be a pointer to a typed object. It will panic if it encounters an error.
func (o *KubeObject) AsOrDie(ptr interface{}) {
	if err := o.As(ptr); err != nil {
		panic(ErrKubeObjectFields{obj: o, fields: nil})
	}
}

// As converts a KubeObject to the desired typed object. ptr must be
// a pointer to a typed object.
func (o *KubeObject) As(ptr interface{}) error {
	err := func() error {
		if o == nil {
			return fmt.Errorf("the object doesn't exist")
		}
		if ptr == nil || reflect.ValueOf(ptr).Kind() != reflect.Ptr {
			return fmt.Errorf("ptr must be a pointer to an object")
		}
		return internal.MapVariantToTypedObject(o.obj, ptr)
	}()
	if err != nil {
		return fmt.Errorf("unable to convert object to %T with error: %w", ptr, err)
	}
	return nil
}

// NewFromTypedObject construct a KubeObject from a typed object (e.g. corev1.Pod)
func NewFromTypedObject(v interface{}) (*KubeObject, error) {
	m, err := internal.TypedObjectToMapVariant(v)
	if err != nil {
		return nil, err
	}
	return asKubeObject(m), nil
}

// String serializes the object in yaml format.
func (o *KubeObject) String() string {
	doc := internal.NewDoc([]*yaml.Node{o.obj.Node()}...)
	s, _ := doc.ToYAML()
	return string(s)
}

// resourceIdentifier returns the resource identifier including apiVersion, kind,
// namespace and name.
func (o *KubeObject) resourceIdentifier() *yaml.ResourceIdentifier {
	apiVersion := o.GetAPIVersion()
	kind := o.GetKind()
	name := o.GetName()
	ns := o.GetNamespace()
	return &yaml.ResourceIdentifier{
		TypeMeta: yaml.TypeMeta{
			APIVersion: apiVersion,
			Kind:       kind,
		},
		NameMeta: yaml.NameMeta{
			Name:      name,
			Namespace: ns,
		},
	}
}

// IsGVK compares the given apiVersion and kind with KubeObject's apiVersion and Kind.
func (o *KubeObject) IsGVK(apiVersion, kind string) bool {
	if o.GetAPIVersion() == apiVersion && o.GetKind() == kind {
		return true
	}
	if apiVersion == "" && o.GetKind() == kind {
		return true
	}
	if kind == "" && o.GetAPIVersion() == apiVersion {
		return true
	}
	return false
}

// IsLocalConfig checks the "config.kubernetes.io/local-config" field to tell
// whether a KRM resource will be skipped by `kpt live apply` or not.
func (o *KubeObject) IsLocalConfig() bool {
	isLocalConfig := o.GetAnnotation(KptLocalConfig)
	if isLocalConfig == "" || isLocalConfig == "false" {
		return false
	}
	return true
}

func (o *KubeObject) GetAPIVersion() string {
	apiVersion, _, _ := o.obj.GetNestedString("apiVersion")
	return apiVersion
}

func (o *KubeObject) SetAPIVersion(apiVersion string) {
	if err := o.obj.SetNestedString(apiVersion, "apiVersion"); err != nil {
		panic(fmt.Errorf("cannot set apiVersion '%v': %v", apiVersion, err))
	}
}

func (o *KubeObject) GetKind() string {
	kind, _, _ := o.obj.GetNestedString("kind")
	return kind
}

func (o *KubeObject) SetKind(kind string) {
	if err := o.obj.SetNestedString(kind, "kind"); err != nil {
		panic(fmt.Errorf("cannot set kind '%v': %v", kind, err))
	}
}

func (o *KubeObject) GetName() string {
	s, _, _ := o.obj.GetNestedString("metadata", "name")
	return s
}

func (o *KubeObject) SetName(name string) {
	if err := o.obj.SetNestedString(name, "metadata", "name"); err != nil {
		panic(fmt.Errorf("cannot set metadata name '%v': %v", name, err))
	}
}

func (o *KubeObject) GetNamespace() string {
	s, _, _ := o.obj.GetNestedString("metadata", "namespace")
	return s
}

func (o *KubeObject) HasNamespace() bool {
	_, found, _ := o.obj.GetNestedString("metadata", "namespace")
	return found
}

func (o *KubeObject) SetNamespace(name string) {
	if err := o.obj.SetNestedString(name, "metadata", "namespace"); err != nil {
		panic(fmt.Errorf("cannot set namespace '%v': %v", name, err))
	}
}

func (o *KubeObject) SetAnnotation(k, v string) {
	if err := o.obj.SetNestedString(v, "metadata", "annotations", k); err != nil {
		panic(fmt.Errorf("cannot set metadata annotations '%v': %v", k, err))
	}
}

// Annotations returns all annotations.
func (o *KubeObject) GetAnnotations() map[string]string {
	v, _, _ := o.obj.GetNestedStringMap("metadata", "annotations")
	return v
}

// Annotation returns one annotation with key k.
func (o *KubeObject) GetAnnotation(k string) string {
	v, _, _ := o.obj.GetNestedString("metadata", "annotations", k)
	return v
}

// RemoveAnnotationsIfEmpty removes the annotations field when it has zero annotations.
func (o *KubeObject) RemoveAnnotationsIfEmpty() error {
	annotations, found, err := o.obj.GetNestedStringMap("metadata", "annotations")
	if err != nil {
		return err
	}
	if found && len(annotations) == 0 {
		_, err = o.obj.RemoveNestedField("metadata", "annotations")
		return err
	}
	return nil
}

func (o *KubeObject) SetLabel(k, v string) {
	if err := o.obj.SetNestedString(v, "metadata", "labels", k); err != nil {
		panic(fmt.Errorf("cannot set metadata labels '%v': %v", k, err))
	}
}

// Label returns one label with key k.
func (o *KubeObject) GetLabel(k string) string {
	v, _, _ := o.obj.GetNestedString("metadata", "labels", k)
	return v
}

// Labels returns all labels.
func (o *KubeObject) GetLabels() map[string]string {
	v, _, _ := o.obj.GetNestedStringMap("metadata", "labels")
	return v
}

func (o *KubeObject) PathAnnotation() string {
	anno := o.GetAnnotation(kioutil.PathAnnotation)
	return anno
}

// IndexAnnotation return -1 if not found.
func (o *KubeObject) IndexAnnotation() int {
	anno := o.GetAnnotation(kioutil.IndexAnnotation)
	if anno == "" {
		return -1
	}
	i, _ := strconv.Atoi(anno)
	return i
}

// IdAnnotation return -1 if not found.
func (o *KubeObject) IdAnnotation() int {
	anno := o.GetAnnotation(kioutil.IdAnnotation)

	if anno == "" {
		return -1
	}
	i, _ := strconv.Atoi(anno)
	return i
}

type KubeObjects []*KubeObject

func (o KubeObjects) Len() int      { return len(o) }
func (o KubeObjects) Swap(i, j int) { o[i], o[j] = o[j], o[i] }
func (o KubeObjects) Less(i, j int) bool {
	idi := o[i].resourceIdentifier()
	idj := o[j].resourceIdentifier()
	idStrI := fmt.Sprintf("%s %s %s %s", idi.GetAPIVersion(), idi.GetKind(), idi.GetNamespace(), idi.GetName())
	idStrJ := fmt.Sprintf("%s %s %s %s", idj.GetAPIVersion(), idj.GetKind(), idj.GetNamespace(), idj.GetName())
	return idStrI < idStrJ
}

func asKubeObject(obj *internal.MapVariant) *KubeObject {
	return &KubeObject{SubObject{obj}}
}

func (o *KubeObject) node() *internal.MapVariant {
	return o.obj
}

func rnodeToKubeObject(rn *yaml.RNode) *KubeObject {
	mapVariant := internal.NewMap(rn.YNode())
	return &KubeObject{SubObject{mapVariant}}
}
