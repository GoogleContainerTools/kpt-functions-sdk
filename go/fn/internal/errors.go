package internal

import (
	"fmt"
)

// ErrOpOrDie raises if the KubeObject operation panics.
type ErrEqualSelector struct {
	field string
	expected string
	actual string
}

func (e *ErrEqualSelector) Error() string {
	return fmt.Sprintf("invalid selector syntax: expect %v, got %v ", e.expected, e.actual)
}
