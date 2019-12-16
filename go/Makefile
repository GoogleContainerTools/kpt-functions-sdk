.PHONY: fix vet fmt test lint

GOPATH := $(shell go env GOPATH)

all: fix fmt test test-e2e lint

fix:
	go fix ./...

fmt:
	go fmt ./...

lint:
	(which $(GOPATH)/bin/golangci-lint || go get github.com/golangci/golangci-lint/cmd/golangci-lint@v1.19.1)
	$(GOPATH)/bin/golangci-lint run ./...

test:
	go test -cover ./...

test-e2e:
	./scripts/e2e.sh

vet:
	go vet ./...

publish: all
	./scripts/publish-functions.sh

