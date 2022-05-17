package main

import (
	"fmt"
	"os"

	"github.com/GoogleContainerTools/kpt-functions-sdk/go/fn"
)

var _ fn.Runner = &SetLabels{}

type SetLabels struct {
	Labels map[string]string `json:"labels,omitempty"`
}

func (r *SetLabels) Run(ctx *fn.Context, _ *fn.KubeObject, items []*fn.KubeObject) {
	for _, o := range items {
		for k, newLabel := range r.Labels {
			o.SetLabel(k, newLabel)
		}
		ctx.ResultInfo(fmt.Sprintf("update %v labels %v", o.ShortString(), r.Labels), o)
	}
}

func main() {
	if err := fn.AsMain(&SetLabels{}); err != nil {
		os.Exit(1)
	}
}
