.PHONY: fix vet fmt test lint

GOPATH := $(shell go env GOPATH)
GOBIN := $(shell go env GOPATH)/bin
OUT_DIR := .out
MODULES = $(shell find . -name 'go.mod' -print)

all: fix fmt lint test

.PHONY: fix
fix: $(MODULES)
	@for f in $(^D); do (cd $$f; echo "Fixing $$f"; go fix ./...) || exit 1; done

.PHONY: fmt
fmt: $(MODULES)
	@for f in $(^D); do (cd $$f; echo "Formatting $$f"; gofmt -s -w .); done

.PHONY: lint
lint: $(MODULES)
	@for f in $(^D); do \
	(cd $$f; echo "Checking golangci-lint $$f"; \
	(which $(GOPATH)/bin/golangci-lint || go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.51.2); \
	$(GOPATH)/bin/golangci-lint run ./...); \
	done

.PHONY: test
test: $(MODULES)
	@for f in $(^D); do (cd $$f; echo "Testing $$f"; go test ./...) || exit 1; done

.PHONY: vet
vet: $(MODULES)
	@#for f in $(^D); do (cd $$f; echo "Checking $$f"; go run honnef.co/go/tools/cmd/staticcheck@latest ./...); done
	@for f in $(^D); do (cd $$f; echo "Vetting $$f"; go vet ./...); done

build-typegen: fix fmt test lint
	env GOOS=linux GOARCH=amd64 go build -o $(OUT_DIR)/linux/amd64/typegen ./cmd
	env GOOS=darwin GOARCH=amd64 go build -o $(OUT_DIR)/darwin/amd64/typegen ./cmd
	env GOOS=windows GOARCH=amd64 go build -o $(OUT_DIR)/windows/amd64/typegen ./cmd
	env GOOS=linux GOARCH=arm64 go build -o $(OUT_DIR)/linux/arm64/typegen ./cmd
	env GOOS=darwin GOARCH=arm64 go build -o $(OUT_DIR)/darwin/arm64/typegen ./cmd
	env GOOS=windows GOARCH=arm64 go build -o $(OUT_DIR)/windows/arm64/typegen ./cmd

package-typegen: build-typegen
	tar -C $(OUT_DIR)/linux/amd64 -czvf $(OUT_DIR)/typegen_linux_amd64.tar.gz typegen
	tar -C $(OUT_DIR)/darwin/amd64 -czvf $(OUT_DIR)/typegen_darwin_amd64.tar.gz typegen
	tar -C $(OUT_DIR)/windows/amd64 -czvf $(OUT_DIR)/typegen_windows_amd64.tar.gz typegen
	tar -C $(OUT_DIR)/linux/arm64 -czvf $(OUT_DIR)/typegen_linux_arm64.tar.gz typegen
	tar -C $(OUT_DIR)/darwin/arm64 -czvf $(OUT_DIR)/typegen_darwin_arm64.tar.gz typegen
	tar -C $(OUT_DIR)/windows/arm64 -czvf $(OUT_DIR)/typegen_windows_arm64.tar.gz typegen
