# Quickstart: Developing KPT Functions

This quickstart will get you started developing a KPT Function with the TypeScript SDK,
using an existing Hello World package.

After you complete this quickstart, you can follow the [complete guide to developing functions](develop.md).

## Prerequisites

### Setting Up Your Local Environment

- Install [node][download-node]
- Install [docker][install-docker]
- Install [kpt][install-docker]

#### `.npmrc` File

In order to install these packages, you need to configure your `.npmrc` file to authenticate to GitHub.

1. Create a Personal Token by navigating to `Settings > Developer settings > Personal access tokens`
   in GitHub. Specify `read:packages` scope.
1. Back up any existing `.npmrc` if it exist:

   ```sh
   mv ~/.npmrc{,.backup}
   ```

1. Create the `.npmrc` file, replacing `<TOKEN>`:

   ```sh
   cat > ~/.npmrc <<EOF
   registry=https://npm.pkg.github.com/googlecontainertools
   //npm.pkg.github.com/:_authToken=<TOKEN>
   EOF
   ```

## Hello World Package

1. Get the `hello-world` package:

   ```sh
   git clone --depth 1 git@github.com:GoogleContainerTools/kpt-functions-sdk.git
   cd kpt-functions-sdk/ts/hello-world
   ```

1. Install all dependencies and build the package:

   ```sh
   npm install
   ```

1. Run the `label_namespace` function:

   ```sh
   export EXAMPLE_CONFIGS=../../example-configs

   kpt fn source $EXAMPLE_CONFIGS |
   node dist/label_namespace_run.js -d label_name=color -d label_value=orange |
   kpt fn sink $EXAMPLE_CONFIGS
   ```

   As the name suggest, this function added the given label to all `Namespaces` in `example-configs`
   directory:

   ```sh
   git diff $EXAMPLE_CONFIGS
   ```

1. Try modifying the function in `src/label_namespace.ts` to perform other operations on `example-configs`.

   You can take a look at [these example functions][demo-funcs] for inspiration.

## Next Steps

- [Complete guide to developing KPT Functions](develop.md)
- [Run a KPT Function](run.md)

[download-node]: https://nodejs.org/en/download/
[install-node]: https://github.com/nodejs/help/wiki/Installation
[install-docker]: https://docs.docker.com/v17.09/engine/installation
[download-kpt]: https://github.com/GoogleContainerTools/kpt
