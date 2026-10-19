// Copyright 2026 The kpt Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package docs

import (
	"fmt"
	"strings"
	"testing"

	"github.com/leanovate/gopter"
	"github.com/leanovate/gopter/gen"
	"github.com/leanovate/gopter/prop"
)

// For any three strings (short, long, examples), formatting them into a README
// with mdtogo markers and then parsing that README with ParseMarkers SHALL
// produce a Sections struct with fields equal to the original strings (after trimming).

// stripMarkers removes any substrings that could be mistaken for mdtogo markers.
func stripMarkers(s string) string {
	s = strings.ReplaceAll(s, "<!--mdtogo:", "")
	s = strings.ReplaceAll(s, "<!--mdtogo", "")
	s = strings.ReplaceAll(s, "<!--", "")
	return s
}

// genSectionContent generates arbitrary non-empty strings that do not contain
// mdtogo markers (which would confuse the parser).
func genSectionContent() gopter.Gen {
	return gen.RegexMatch(`[a-zA-Z0-9 \t\n.,;:!?(){}\[\]'"/_-]{1,200}`).
		Map(stripMarkers)
}

// formatMarkedREADME formats three section strings into a README with mdtogo markers.
func formatMarkedREADME(short, long, examples string) string {
	return fmt.Sprintf(`<!--mdtogo:Short-->
%s
<!--mdtogo-->

<!--mdtogo:Long-->
%s
<!--mdtogo-->

<!--mdtogo:Examples-->
%s
<!--mdtogo-->
`, short, long, examples)
}

// genNoMarkerContent generates arbitrary strings guaranteed not to contain
// any mdtogo marker substrings.
func genNoMarkerContent() gopter.Gen {
	return gen.RegexMatch(`[a-zA-Z0-9 \t\n.,;:!?(){}\[\]'"/_-]{0,300}`).
		Map(stripMarkers)
}

func TestProperty7_MissingMarkersFallback(t *testing.T) {
	properties := gopter.NewProperties(nil)

	properties.Property("missing markers fall back to Long", prop.ForAll(
		func(content string) string {
			sections := ParseMarkers([]byte(content))

			if sections.Short != "" {
				return fmt.Sprintf("Short should be empty for content without markers, got: %q", sections.Short)
			}
			if sections.Examples != "" {
				return fmt.Sprintf("Examples should be empty for content without markers, got: %q", sections.Examples)
			}
			if got, want := sections.Long, strings.TrimSpace(content); got != want {
				return fmt.Sprintf("Long mismatch:\n  got:  %q\n  want: %q", got, want)
			}
			return ""
		},
		genNoMarkerContent(),
	))

	properties.TestingRun(t)
}

func TestProperty1_MarkerParserRoundTrip(t *testing.T) {
	properties := gopter.NewProperties(nil)

	properties.Property("marker parser round trip", prop.ForAll(
		func(short, long, examples string) string {
			readme := formatMarkedREADME(short, long, examples)
			sections := ParseMarkers([]byte(readme))

			if got, want := sections.Short, strings.TrimSpace(short); got != want {
				return fmt.Sprintf("Short mismatch:\n  got:  %q\n  want: %q", got, want)
			}
			if got, want := sections.Long, strings.TrimSpace(long); got != want {
				return fmt.Sprintf("Long mismatch:\n  got:  %q\n  want: %q", got, want)
			}
			if got, want := sections.Examples, strings.TrimSpace(examples); got != want {
				return fmt.Sprintf("Examples mismatch:\n  got:  %q\n  want: %q", got, want)
			}
			return ""
		},
		genSectionContent(),
		genSectionContent(),
		genSectionContent(),
	))

	properties.TestingRun(t)
}
