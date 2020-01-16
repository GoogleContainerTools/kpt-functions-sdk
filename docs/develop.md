# Developing KPT Functions

This guide will walk you through developing a KPT function using the Typescript SDK.

## Prerequisites

### System Requirements

Supported platforms: amd64 Linux/Mac/Windows

### Setting Up Your Local Environment

- Install [node][download-node]
  - The SDK requires `npm` version 6 or higher.
  - If installing node from binaries (i.e. without a package manager), follow these
    [installation instructions][install-node].
- Install [docker][install-docker]

#### `.npmrc` File

Currently, NPM packages in the SDK are published to [private GitHub package in this repo][npm-packages].

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

### Your Kubernetes Cluster

For the type generation functionality to work, you need a Kubernetes cluster with this [beta feature][beta-feature].

#### Using a `kind` Cluster

The easiest way to get developing is to use `kind` to bring up a local cluster, running in a docker
container.

1. Download the [kind binary][download-kind] version 0.5.1 or higher
1. Use this config file:

   ```sh
   cat > kind.yaml <<EOF
   kind: Cluster
   apiVersion: kind.sigs.k8s.io/v1alpha3
   kubeadmConfigPatches:
   - |
     apiVersion: kubeadm.k8s.io/v1beta1 # Use v1beta1 for 1.14, v1beta2 for 1.15+
     kind: ClusterConfiguration
     metadata:
       name: config
     apiServer:
       extraArgs:
         "feature-gates": "CustomResourcePublishOpenAPI=true"
   nodes:
   - role: control-plane
   EOF
   ```

   Note the use of the beta feature.

1. Create the cluster and point the KUBECONFIG environment variable to it:

   ```sh
   kind create cluster --name=kpt-functions --config=kind.yaml --image=kindest/node:v1.14.6
   export KUBECONFIG="$(kind get kubeconfig-path --name="kpt-functions")"
   ```

#### Using a GKE cluster

You can also use a deployed cluster in GKE. The beta k8s feature is avilable only when using GKE's
`--enable-kubernetes-alpha` flag, as seen here:

```sh
gcloud container clusters create $USER-1-14-alpha --enable-kubernetes-alpha --cluster-version=latest --region=us-central1-a --project <PROJECT>
gcloud container clusters get-credentials $USER-1-14-alpha --zone us-central1-a --project <PROJECT>
```

The second command will update your `~/.kube/config`, so no need to set the env variable.

### Working with CRDs

If your function uses a Custom Resource Definition, make sure you apply it to the cluster before
generating the SDK. Typescript uses the k8s server to generate the types represented there,
including your CRD.

```sh
kubectl apply -f /path/to/my/crd.yaml
```

## Create the NPM package

To initialize a new NPM package, first create a package directory:

```sh
mkdir my-package
cd my-package
```

> **Note:** All subsequent commands are run from the `my-package/` directory.

Run the interactive initializer:

```sh
npm init @googlecontainertools/kpt-functions
```

Or, alternatively install the package globally and then run it:

```sh
npm install -g @googlecontainertools/create-kpt-functions
create-kpt-functions
```

Follow the instructions and respond to all prompts.

This process will create the following:

1. `package.json`: The `kpt-functions` framework library is the only item declared in `dependencies`.
   Everything required to compile and test your KPT function is declared as `devDependencies`,
   including the `create-kpt-functions` CLI discussed later in the `README`.
1. `src/`: Directory containing the source files for all your functions, e.g.:

   - `my_func.ts`: Implement your function's interface here.
   - `my_func_test.ts`: Unit tests for your function.
   - `my_func_run.ts`: The entry point from which your function is run.

1. `src/gen/`: Contains Kubernetes core and CRD types generated from the OpenAPI spec published by the cluster you selected.
1. `build/`: Contains Dockerfile for each function, e.g.:
   - `my_func.Dockerfile`

Next, install all package dependencies:

```sh
npm install
```

In addition to installation, `install` compiles your function into the `dist/` directory.

You can run your function directly:

```sh
node dist/my_func_run.js --help
```

Currently, it simply passes through the input configuration data. Let's remedy this.

## Implementing the function

You can now start implementing the function using your favorite IDE, e.g. [VSCode][vscode]:

```sh
code .
```

In `src/my_func.ts`, implement this simple interface:

```ts
/**
 * Interface describing KPT functions.
 */
export interface KptFunc {
  /**
   * A function consumes and optionally mutates configuration objects using the Configs object.
   *
   * The function should return a ConfigError when encountering one or more configuration-related issues.
   *
   * The function can throw any other error types when encountering operational issues such as IO exceptions.
   */
  (configs: Configs): void | ConfigError;

  /**
   * Usage message describing what the function does, how to use it, and how to configure it.
   */
  usage: string;
}
```

The [configs][configs-api] parameter is an in-memory document store of Kubernetes objects populated
from/to configuration files. It enables rich query and mutation operations.

Take a look at [these example functions][demo-funcs] to better understand how to use
`kpt-functions` library. These functions are available as docker images documented in the [catalog][catalog].

Once you've written some code, build the package with:

```sh
npm run build
```

Alternatively, run the following in a separate terminal. It will continuously build your function
as you make changes:

```sh
npm run watch
```

To run the tests, use:

```sh
npm test
```

## Container images

With your working function in-hand, it's time to package your function into an executable docker
image.

`docker build` also requires authentication to GitHub, via the aforementioned credentials:

```sh
cp ~/.npmrc .
```

To build the docker image:

```sh
npm run kpt:docker-build
```

You can now run the image as a docker container, e.g.:

```sh
docker run gcr.io/kpt-functions-demo/my-func:dev --help
```

To push the image to your container registry of choice:

```sh
npm run kpt:docker-push
```

You'll need proper authentication/authorization to push to your registry.

`kpt:docker-push` pushes to the registry specified in the `kpt.docker_repo_base` field in `package.json`.
You can manually edit this field at any time.

The default value for the docker image tag is `dev`. This can be overridden using`--tag` flag:

```sh
npm run kpt:docker-build -- --tag=latest
npm run kpt:docker-push -- --tag=latest
```

## SDK CLI

The `create-kpt-functions` package (installed as `devDependencies`), provides a CLI for managing
the NPM package you created above. The CLI sub-commands can be invoked via `npm run`, e.g.:

```console
npm run kpt:function-create -- --help
```

These sub-commands are available:

```console
kpt:docker-create       Generate Dockerfiles for all functions. Overwrite
                        files if they exist.
kpt:docker-build        Build docker images for all functions.
kpt:docker-push         Push docker images to the registry for all functions.
kpt:function-create     Generate stubs for a new function. Overwrites files
                        if they exist.
kpt:type-create         Generate classes for core and CRD types. Overwrite
                        files if they exist.
```

> **Note:** Flags are passed to the CLI after the `--` separator.

## Next Steps

- [Running KPT Functions](run.md)

[spec]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
[kustomize-run]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-impl.md
[demo-funcs]: https://github.com/GoogleContainerTools/kpt-functions-sdk/tree/master/ts/demo-functions/src
[label-namespace]: https://github.com/GoogleContainerTools/kpt-functions-sdk/tree/master/ts/demo-functions/src/label_namespace.ts
[catalog]: https://github.com/GoogleContainerTools/kpt-functions-catalog
[configs-api]: https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/kpt-functions/src/types.ts
[vscode]: https://code.visualstudio.com/
[npm-packages]: https://github.com/GoogleContainerTools/kpt-functions-sdk/packages
[download-node]: https://nodejs.org/en/download/
[download-kind]: https://github.com/kubernetes-sigs/kind
[install-node]: https://github.com/nodejs/help/wiki/Installation
[install-docker]: https://docs.docker.com/v17.09/engine/installation
[beta-feature]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.15.md#customresourcedefinition-openapi-publishing
