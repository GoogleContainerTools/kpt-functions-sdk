# Quickstart to Developing KPT Functions

This quickstart will get you started developing a KPT Function with the TypeScript SDK,
using an existing Hello World package.

After you complete this quickstart, you can follow the
[complete guide to developing functions](develop.md).

## Prerequisites

### System Requirements

Currently supported platforms: amd64 Linux/Mac

### Setting Up Your Local Environment

- Install [node][download-node]
- Install [docker][install-docker]
- Install [kpt][download-kpt] and add it to \$PATH

## Hello World Package

1. Get the `hello-world` package:

   ```sh
   git clone --depth 1 git@github.com:GoogleContainerTools/kpt-functions-sdk.git
   ```

   All subsequent commands are run from the `hello-world` directory:

   ```sh
   cd kpt-functions-sdk/ts/hello-world
   ```

1. Install all dependencies:

   ```sh
   npm install
   ```

1. Run the following in a separate terminal to continuously build your function as you make changes:

   ```sh
   npm run watch
   ```

1. Run the `label_namespace` function:

   ```sh
   export CONFIGS=../../example-configs

   kpt fn source $CONFIGS |
   node dist/label_namespace_run.js -d label_name=color -d label_value=orange |
   kpt fn sink $CONFIGS
   ```

   As the name suggests, this function added the given label to all `Namespace` objects
   in the `example-configs` directory:

   ```sh
   git diff $CONFIGS
   ```

1. Try modifying the function in `src/label_namespace.ts` to perform other operations
   on `example-configs`, then repeat step 4.

   The function should implement the `KptFunc` interface [documented here][api-kptfunc].

   Take a look at [these example functions][demo-funcs] to better understand how to use
   the `kpt-functions` SDK.

## Next Steps

- [Complete guide to developing KPT Functions from scratch](develop.md)
- [Running KPT Functions](run.md)

[download-node]: https://nodejs.org/en/download/
[install-node]: https://github.com/nodejs/help/wiki/Installation
[install-docker]: https://docs.docker.com/v17.09/engine/installation
[download-kpt]: https://github.com/GoogleContainerTools/kpt
[demo-funcs]: https://github.com/GoogleContainerTools/kpt-functions-sdk/tree/master/ts/demo-functions/src
[api-kptfunc]: https://googlecontainertools.github.io/kpt-functions-sdk/docs/api/interfaces/_types_.kptfunc.html
