.PHONY: fix vet fmt test lint

GOPATH := $(shell go env GOPATH)
OUT_DIR := .out

all: fix fmt test lint

api:
	(which swagger || go install github.com/go-swagger/go-swagger/cmd/swagger@v0.27.0)
	$(GOPATH)/bin/swagger generate spec -m -w api/kptfile/v1 -o ../openapi/kptfile.yaml

fix:
	go fix ./...

fmt:
	go fmt ./...

lint:
	(which $(GOPATH)/bin/golangci-lint || go get github.com/golangci/golangci-lint/cmd/golangci-lint)
	$(GOPATH)/bin/golangci-lint -c ./.golangci.yml run ./...

test:
	go test -cover ./...

vet:
	go vet ./...
