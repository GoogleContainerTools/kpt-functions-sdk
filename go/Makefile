.PHONY: fix vet fmt test lint

GOPATH := $(shell go env GOPATH)

all: fix fmt test test-e2e lint

fix:
	go fix ./...

fmt:
	go fmt ./...

lint:
	(which $(GOPATH)/bin/golangci-lint || go get github.com/golangci/golangci-lint/cmd/golangci-lint)
	$(GOPATH)/bin/golangci-lint run ./...

test:
	go test -cover ./...

test-e2e:
	./scripts/e2e.sh

vet:
	go vet ./...

publish-functions: all
	./scripts/publish-functions.sh

publish-typegen: all
	go install ./cmd/typegen
	cp $(GOPATH)/bin/typegen ../ts/create-kpt-functions/bin/

