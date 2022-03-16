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

func handleOptOrDieErr() {
	if v := recover(); v != nil {
		if e, ok := v.(ErrOpOrDie); ok {
			log.Fatalf(e.Error())
		} else {
			panic(v)
		}
	}
}
