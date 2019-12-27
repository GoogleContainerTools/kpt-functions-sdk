# KPT Functions

Using KPT Functions Typescript SDK, it is easy to implement [Configuration Functions][spec].
The framework provides a simple, yet powerful API for querying and manipulating configuration
files and provides all the scaffolding required to develop, build, test, and publish functions so
the user can focus on implementing their business-logic.

## Using Typescript SDK

### Required Dependencies

#### Local Environment

- Install [npm](https://www.npmjs.com/get-npm)
- Install [docker](https://docs.docker.com/v17.09/engine/installation/)

##### `.npmrc` file

Currently, NPM packages in the SDK are published to [private GitHub package in this repo][npm-packages].

In order to install these packages, you need to configure your `.npmrc` file to authenticate to GitHub.

1. Create a Personal Token by navigating to `Settings > Developer settings > Personal access tokens` in GitHub. Specify `read:packages` scope.
1. Create the `.npmrc` file, replacing `<TOKEN>`:

   ```sh
   cat > ~/.npmrc <<EOF
   registry=https://npm.pkg.github.com/googlecontainertools
   //npm.pkg.github.com/:_authToken=<TOKEN>
   EOF
   ```

#### Kubernetes Cluster

For the type generation feature to work, you need a Kubernetes cluster with this
[beta feature](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.15.md#customresourcedefinition-openapi-publishing).

##### Using a `Kind` cluster

The easiest way is to use `Kind` to bring up a local cluster running as a docker container.

1. Download the [kind binary][kind-binary]
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

1. Create the cluster and point your KUBECONFIG to it:

   ```sh
   kind create cluster --name=kpt-functions --config=kind.yaml --image=kindest/node:v1.14.6
   export KUBECONFIG="$(kind get kubeconfig-path --name="kpt-functions")"
   ```

##### Using a GKE cluster

On GKE, this feature is available using an alpha cluster:

```sh
gcloud container clusters create $USER-1-14-alpha --enable-kubernetes-alpha --cluster-version=latest --region=us-central1-a --project <PROJECT>
gcloud container clusters get-credentials $USER-1-14-alpha --zone us-central1-a --project <PROJECT>
```

### Create the NPM package

To start a new NPM package, run the following and follow the instructions and prompts:

```sh
mkdir my-package
cd my-package
npm init @googlecontainertools/kpt-functions
```

**Note:** Going forward, all the commands are assumed to be run from `my-package` directory.

This will create the following files:

1. `package.json`: Declares `kpt-functions` framework library as the only item in `dependencies`.
   Everything required to compile, lint and test a KPT function is declared as `devDependencies`,
   including the `create-kpt-functions` CLI discussed later.
1. `src/`: Contains the source files for all your functions, e.g.:

   - `my_func.ts`: This is where you implement the function interface.
   - `my_func_test.ts`: This is where you add your unit test.
   - `my_func_run.ts`: The entry point that runs the function.

1. `src/gen/`: Contains Kubernetes core and CRD types generated from the OpenAPI spec published by the cluster you selected.
1. `build/`: Contains Dockerfile for each function, e.g.:
   - `my_func.Dockerfile`

Run the following command to install all the dependencies and compile the functions into `dist/` directory.

```sh
npm install
```

You can run your function at this point:

```sh
node dist/my_func_run.js --help
```

Although it's not very interesting as it simply passes the input unchanged to the output.
Let's remedy this.

### Implementing the function

You can now start implementing the function using your favorite IDE, e.g. [VSCode][vscode]:

```sh
code .
```

In `src/my_func.ts` you need to implement this simple interface:

```ts
/**
 * Interface describing KPT functions.
 */
export interface KptFunc {
  /**
   * A function consumes and optionally mutates configuration objects using the Configs object.
   *
   * The function should return a ConfigError when encountering one or more configuration-related issues.
   * This includes encountering invalid input for validation use cases.
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

[Configs][configs-api] parameter is a document store for Kubernetes objects populated from/to configuration files.
It enables performing rich query and mutation operations.

Take a look at [these example functions][demo-funcs] to better understand how to use `kpt-functions` library.

To build the package:

```sh
npm run build
```

Alternatively, run this in a separate terminal to continuously build as you make changes:

```sh
npm run watch
```

To run the tests:

```sh
npm test
```

### Container images

At this point you're ready to package and run your function as an executable container image.

Docker build also requires authentication to GitHub:

```sh
cp ~/.npmrc .
```

To build the image:

```sh
npm run kpt:docker-build
```

You can now run the function container, e.g.:

```sh
docker run gcr.io/kpt-functions-demo/my-func:dev --help
```

To push the image to the registry:

```sh
npm run kpt:docker-push
```

This uses the `kpt.docker_repo_base` field in `package.json` populated during initialization.

The default value for docker image tag is `dev`. This can be overridden using`--tag` flag:

```sh
npm run kpt:docker-build -- --tag=latest
npm run kpt:docker-push -- --tag=latest
```

### SDK CLI

`create-kpt-functions` package which is installed as a `devDependencies` provides the `kpt` CLI
for interacting with the NPM package:

```console
KPT functions CLI.

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.

subcommands:
  {package-create,docker-create,docker-build,docker-push,function-create,type-create,workflow-create}
    package-create      Create a new NPM package.
    docker-create       Generate Dockerfiles for all functions. Overwrite
                        files if they exist.
    docker-build        Build docker images for all functions.
    docker-push         Push docker images to the registry for all functions.
    function-create     Generate stubs for a new function. Overwrites files
                        if they exist.
    type-create         Generate classes for core and CRD types. Overwrite
                        files if they exist.
    workflow-create     Generate workflow configs for all functions.
                        Overwrite configs if they exist.
```

There are corresponding scripts in `package.json` for sub-commands provided by the CLI.

To see the help message:

```console
npm run kpt:docker-build -- --help
```

**Note:** Flags are passed to the CLI after `--` separator.

## Running KPT functions

### Using `docker run`

Following steps above, you have a function container that can be run locally:

```sh
docker run gcr.io/kpt-functions-demo/my-func:dev --help
```

But how do you read and write configuration files?

You need to use `Source` and `Sink` functions, for example, `read-yaml` and `write-yaml`
functions from the [KPT functions catalog][catalog].

1. Pull function images:

   ```sh
   docker pull gcr.io/kpt-functions/read-yaml
   docker pull gcr.io/kpt-functions/write-yaml
   ```

1. Using a configs directory, e.g.:

   ```sh
   git clone git@github.com:frankfarzan/foo-corp-configs.git
   cd foo-corp-configs
   ```

1. Run `read-yaml` function, and pipe its output to `less` command:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   less
   ```

1. Pipe the output of `read-yaml` to your function and pipe its output to `less` command:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   docker run -i gcr.io/kpt-functions-demo/my-func:dev |
   less
   ```

1. Pipe the output of your function to `write-yaml` function:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   docker run -i gcr.io/kpt-functions-demo/my-func:dev |
   docker run -i -u $(id -u) -v $(pwd):/sink gcr.io/kpt-functions/write-yaml -o /dev/null -d sink_dir=/sink -d overwrite=true
   ```

1. See the changes made to the configs directory:

   ```sh
   git status
   ```

### Using `kustomize config run`

KPT functions can be run using `kustomize` as [documented here][kustomize-run].

[spec]: https://github.com/frankfarzan/kustomize/blob/functions-doc/cmd/config/docs/api-conventions/functions-spec.md
[demo-funcs]: https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/demo-functions/src
[catalog]: https://github.com/GoogleContainerTools/kpt-functions-catalog
[configs-api]: https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/kpt-functions/src/types.ts
[vscode]: https://code.visualstudio.com/
[kustomize-run]: https://github.com/frankfarzan/kustomize/blob/functions-doc/cmd/config/docs/api-conventions/functions-impl.md
[kind-binary]: https://github.com/kubernetes-sigs/kind
[npm-packages]: https://github.com/GoogleContainerTools/kpt-functions-sdk/packages
