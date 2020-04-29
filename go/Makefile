.PHONY: fix vet fmt test lint

GOPATH := $(shell go env GOPATH)
OUT_DIR := .out

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

build-typegen: fix fmt test lint
	env GOOS=linux GOARCH=amd64 go build -o $(OUT_DIR)/linux/typegen ./cmd/typegen
	env GOOS=darwin GOARCH=amd64 go build -o $(OUT_DIR)/darwin/typegen ./cmd/typegen
	env GOOS=windows GOARCH=amd64 go build -o $(OUT_DIR)/windows/typegen ./cmd/typegen

package-typegen: build-typegen
	tar -C $(OUT_DIR)/linux -czvf $(OUT_DIR)/typegen_linux_amd64.tar.gz typegen
	tar -C $(OUT_DIR)/darwin -czvf $(OUT_DIR)/typegen_darwin_amd64.tar.gz typegen
	tar -C $(OUT_DIR)/windows -czvf $(OUT_DIR)/typegen_windows_amd64.tar.gz typegen
