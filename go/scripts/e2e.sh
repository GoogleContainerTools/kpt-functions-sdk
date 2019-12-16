set -euo pipefail 

rm -f /tmp/gatekeeper.txt
go run cmd/gatekeeper_validate/gatekeeper_validate.go --input testdata/source/pod-security-policy.yaml 2> /tmp/gatekeeper.txt || true
grep -q "Found 80 violations" /tmp/gatekeeper.txt || echo "gatekeeper function has Unexpected results"
