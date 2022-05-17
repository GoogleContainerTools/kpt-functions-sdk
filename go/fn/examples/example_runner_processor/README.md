This function is equivalent to `gcr.io/kpt-fn/set-labels` (no `additionalFieldSpecs` feature).

To use `ConfigMap` as function config, run: 
```bash
kpt fn source data --fn-config data/fn-config-configmap.yaml | go run main.go
```

To use `SetLabels` as function config, run:
```bash
kpt fn source data --fn-config data/fn-config-setlabels.yaml | go run main.go
```
