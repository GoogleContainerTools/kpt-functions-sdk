import { Configs } from 'kpt-functions';

export async function myFunc(configs: Configs) {
  // TODO: implement.
}

myFunc.usage = `
TODO: fill the following usage template.

Overview
Explain what this function does in one or two sentences.

Synopsis
Explain the function config and behavior for this function in detail. If the
function supports both ConfigMap and CRD as function config, both should be
documented.

Examples
Use examples to demonstrate how to use this function in different scenarios.
Each example should have input, exact command to run and output.
`;
