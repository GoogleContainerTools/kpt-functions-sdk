/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * An overwritable log command allowing redirecting logging output.
 *
 * It is possible to directly overwrite console.log, but this causes many known issues.
 *
 * A better solution would involve defining our own logger.
 */
export let log = console.log;

/**
 * Causes log to do nothing. For use in testing.
 */
export function disableLogForTesting() {
  log = () => {
    return;
  };
}
