import { Configs, Runner } from 'kpt-functions';

/**
 * A stub kpt function.
 *
 * @param configs The configs to validate/mutate.
 */
export function demoFunction(configs: Configs) {
  return;
}

export const RUNNER = Runner.newFunc(demoFunction);
