# KPT Functions

KPT Functions are client-side programs that operate on Kubernetes configuration files.

Example use cases:

- **Enforce policy:** e.g. Require all `Namespace` configurations to have a `cost-center` label.
- **Generate configuration:** e.g. Provide a blueprint for new services by generating a `Namespace` with organization-mandated defaults for `RBAC`, `ResourceQuota`, etc.
- **Mutate/migrate configuration:** e.g. Change a field in all `PodSecurityPolicy` configurations to make them more secure.

<<<<<<< HEAD
KPT functions can be run as one-off functions or as part of a CI/CD pipeline.

With GitOps workflows, KPT functions read and write configuration files from a Git repo. Changes
to the system authored by humans and mutating KPT functions are reviewed before being committed to the repo. KPT functions
can be run as pre-commit or post-commit steps to check for compliance before configurations are
applied to a cluster.
=======
KPT functions can be run independently or as part of a CI/CD pipeline.

Functions that run independently inject configuration and output new configuration.  The functions
serve as a tool to generate large amounts of varied configuration that can be subsequently
reviewed and applied.

In CI/CD, KPT Functions can validate your configuration before committing, much like one might
unit-test a piece of application code.  This can be extended into a GitOps workflow, where commits
to one repo might trigger a mutating KPT Function that writes to another.

KPT Functions are versatile and composable; they can be mixed and matched to meet the unique needs
of your infrastructure.
>>>>>>> f934d5f... Wordsmithing and clarifying the readme

In CI/CD, KPT Functions can validate your configuration before committing.  Many production outages
are caused by misconfiguration, with code review serving as the only config validation.  KPT Functions
can programmatically enforce standards and practices, building safety into your infrastructure
development flow.

## Why KPT Functions

- **Configuration is data:** Many configuration tools conflate data with the operations on that
  data (e.g. YAML files embedding a templating language).
  As configuration becomes complex, it becomes hard to read and understand.
  Our design philosophy is to separate human-readable data from the state-less programs that
  manipulate that data.  We call these programs `functions`.
- **Unix philosophy:** Functions should be small, reusable, and composable.
  By implementing the [Configuration Functions Specification][spec],
  we can develop an ever-growing catalog of useful, interoperable functions.

## Why a Typescript SDK

We provide an opinionated Typescript SDK for implementing KPT Functions. This provides various
advantages:

- **General-purpose language:** Domain-Specific Languages begin their life with a reasonable
<<<<<<< HEAD
  feature set, but often grow over time.  They bloat in order to accommodate the tremendous variety
=======
  feature set, often but grow over time.  They bloat in order to accommodate the expansive variety
>>>>>>> f934d5f... Wordsmithing and clarifying the readme
  of customer use cases. Rather than follow this same course, KPT functions employ a true,
  general-purpose programmaing language that provides:
  - Proper abstractions and language features
  - A extensive ecosystem of tooling (e.g. IDE support)
  - A comprehensive catalog of well-supported libraries
  - Robust community support and detailed documentation
- **Type-safety:** Kubernetes configuration is typed, and its schema is defined using the OpenAPI spec.
<<<<<<< HEAD
  Typescript has a sophisticated type system that accomodates the complexity of Kubernetes resources.
  The SDK enables generating Typescript classes for core and CRD types, providing safe and easy
  interaction with Kubernetes objects.
- **Batteries-included:** The SDK provides a simple, powerful API for querying and manipulating configuration
  files. It provides the scaffolding required to develop, build, test, and publish functions,
=======
  Typescript has a sophisticated type system that accomodates the complexity of Kubernetes resource.
  The SDK enables generating Typescript classes for core and CRD types, providing safe and easy
  interaction with Kubernetes objects.
- **Batteries-included:** The SDK provides a simple, powerful API for querying and manipulating configuration
  files. It provides the scaffolding required to develop, build, test, and publish functions, 
>>>>>>> f934d5f... Wordsmithing and clarifying the readme
  allowing you to focus on implementing your business-logic.

## Concepts

### Function

At a high level, a function can be conceptualized like so:

![function][img-func]

- `FUNC`: A program, packaged as a docker container, that performs CRUD (Create, Read, Update,
  Delete) operations on the input.
- `input`: A Kubernetes List type containing objects to operate on.
- `output`: A Kubernetes List type containing the resultant Kubernetes objects.
- `functionConfig`: An optional Kubernetes object used to parameterize the function's behavior.

See [Configuration Functions Specification][spec] for further details.

There are two special-case functions:

### Source Function

A Source Function takes no `input`:

![source][img-source]

Instead, the function typically produces the `output` by reading configurations from an external
system (e.g. reading files from a filesystem).

### Sink Function

A Sink Function produces no `output`:

![sink][img-sink]

Instead, the function typically writes configurations to an external system (e.g. writing files to a filesystem).

### Pipeline

Functions can be composed into a pipeline:

![pipeline][img-pipeline]

<<<<<<< HEAD
## Using the Typescript SDK
=======
## Using The Typescript SDK
>>>>>>> f934d5f... Wordsmithing and clarifying the readme

### System Requirements

The current release requires x86 64-bit Linux. Other platforms will be supported in version 1.0.0.

#### Setting Up Your Local Environment

- Install [node][download-node]
  - The SDK requires `npm` version 6 or higher.
<<<<<<< HEAD
  - If installig node from binaries (i.e. without a package manager), follow these
=======
  - If installig node from binaries (i.e. without a package manager ), follow these
>>>>>>> f934d5f... Wordsmithing and clarifying the readme
  [installation instructions][install-node].
- Install [docker][install-docker]

##### `.npmrc` File

Currently, NPM packages in the SDK are published to [private GitHub package in this repo][npm-packages].

In order to install these packages, you need to configure your `.npmrc` file to authenticate to GitHub.

1. Create a Personal Token by navigating to `Settings > Developer settings > Personal access tokens`
   in GitHub. Specify `read:packages` scope.
1. Create the `.npmrc` file, replacing `<TOKEN>`:

   ```sh
   cat > ~/.npmrc <<EOF
   registry=https://npm.pkg.github.com/googlecontainertools
   //npm.pkg.github.com/:_authToken=<TOKEN>
   EOF
   ```

#### Your Kubernetes Cluster

For the type generation functionality to work, you need a Kubernetes cluster with this [beta feature][beta-feature].

##### Using a `kind` Cluster

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

##### Using a GKE cluster

You can also use a deployed cluster in GKE.  The beta k8s feature is avilable only when using GKE's
`--enable-kubernetes-alpha` flag, as seen here:

```sh
gcloud container clusters create $USER-1-14-alpha --enable-kubernetes-alpha --cluster-version=latest --region=us-central1-a --project <PROJECT>
gcloud container clusters get-credentials $USER-1-14-alpha --zone us-central1-a --project <PROJECT>
```

The second command will update your `~/.kube/config`, so no need to set the env variable.
<<<<<<< HEAD

### Working with CRDs

If your function uses a Custom Resource Definition, make sure you apply it to the cluster before
generating the SDK.  Typescript uses the k8s server to generate the types represented there,
including your CRD.
=======

### Working with CRDs

If your function uses a Custom Resource Definition, make sure you apply it to the cluster before
generating the SDK.  Typescript uses the k8s server to generate the types represented there,
including your CR.
>>>>>>> f934d5f... Wordsmithing and clarifying the readme

```sh
kubectl apply -f /path/to/my/crd.yaml
```

### Create the NPM package

To initialize a new NPM package, run the following:

```sh
mkdir my-package
cd my-package
npm init @googlecontainertools/kpt-functions
```

Follow the instructions and respond to all prompts.

<<<<<<< HEAD
>**Note:** All subsequent commands are run from the `my-package/` directory.
=======
<sub>_**Note:** Going forward, all commands are assumed to be run from the `my-package` directory._<sub>
>>>>>>> f934d5f... Wordsmithing and clarifying the readme

`npm init` will create the following files:

1. `package.json`: The `kpt-functions` framework library is the only item declared in `dependencies`.
<<<<<<< HEAD
   Everything required to compile and test your KPT function is declared as `devDependencies`,
=======
   Everything required to compile, lint and test your KPT function is declared as `devDependencies`,
>>>>>>> f934d5f... Wordsmithing and clarifying the readme
   including the `create-kpt-functions` CLI discussed later in the `README`.
1. `src/`: Directory containing the source files for all your functions, e.g.:

   - `my_func.ts`: Implement your function's interface here.
   - `my_func_test.ts`: Unit tests for your function.
   - `my_func_run.ts`: The entry point from which your function is run.

1. `src/gen/`: Contains Kubernetes core and CRD types generated from the OpenAPI spec published by the cluster you selected.
1. `build/`: Contains Dockerfile for each function, e.g.:
   - `my_func.Dockerfile`

Next, install all project dependencies:

```sh
npm install
```

In addition to installation, `install` compiles your function into the `dist/` directory.

You can run your function directly:

```sh
node dist/my_func_run.js --help
```

Currently, it simply passes through the input configuration data.  Let's remedy this.

### Implementing the function

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

Alternatively, run the following in a separate terminal.  It will continuously build your function
as you make changes:

```sh
npm run watch
```

To run the tests, use:

```sh
npm test
```

### Container images

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

Docker images are often held in a docker registry.  To push the image to your registry of choice:

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

### SDK CLI

The `create-kpt-functions` package, which is installed via `devDependencies`, provides the `kpt` CLI
<<<<<<< HEAD
to help develop new functions.  It includes commands to create, build, publish, and more:
=======
for interacting with the KPT functions libraries:
>>>>>>> f934d5f... Wordsmithing and clarifying the readme

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

There are corresponding scripts in `package.json` for the sub-commands provided by the CLI.

To see the help message:

```console
npm run kpt:docker-build -- --help
```

<<<<<<< HEAD
>**Note:** Flags are passed to the CLI after the `--` separator.
=======
<sub>_**Note:** Flags are passed to the CLI after the `--` separator._<sub>
>>>>>>> f934d5f... Wordsmithing and clarifying the readme

## Running KPT functions

### Using `node` or `docker run`

After following the steps above, you'll have a function that can be run locally using `node`:

```sh
node dist/my_func_run.js --help
```

or as a docker container:

```sh
docker run gcr.io/kpt-functions-demo/my-func:dev --help
```

But how do you read and write configuration files?

### Constructing Pipelines

Pipelines usually require [source and sink functions](#source-function), for example, the `read-yaml` and `write-yaml`
functions from the [KPT functions catalog][catalog].  Pull them from the kpt-functions docker registry:

   ```sh
   docker pull gcr.io/kpt-functions/read-yaml
   docker pull gcr.io/kpt-functions/write-yaml
   ```

You'll also need some source configuration.  You can try this example configuration:

   ```sh
   git clone git@github.com:frankfarzan/foo-corp-configs.git
   cd foo-corp-configs
   ```

With these tools prepared, construct your pipeline like so:

1. Run the `read-yaml` function and view its output by piping to the `less` command:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   less
   ```

1. Include your function in the pipeline:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   docker run -i gcr.io/kpt-functions-demo/my-func:dev |
   less
   ```

   During development, you can run your function directly using `node` to avoid having to rebuild
   the docker image on every change:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   node dist/my_func_run.js |
   less
   ```

1. To persist the changes on the file system, pipe the output to the `write-yaml` function:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   docker run -i gcr.io/kpt-functions-demo/my-func:dev |
   docker run -i -u $(id -u) -v $(pwd):/sink gcr.io/kpt-functions/write-yaml -o /dev/null -d sink_dir=/sink -d overwrite=true
   ```

1. See the changes made to the configs directory:

   ```sh
   git status
   ```

#### Understanding Docker Flags

- `-u`: By default, docker containers run as a non-privileged user.  Privileged actions, like
filesystem access or calls to the network, require escalated access.  Note the example usages of
`read-yaml`, which include `docker run -u $(id -u)`, running docker with your user ID.
<<<<<<< HEAD
- `-v`: Filesystem access requires mounting your container's filesystem onto your local
filesystem. For example, the `read-yaml` command includes the following: `-v $(pwd):/source`.  This connects
=======
- `-v`: Filesystem access requires a mounting your container's filesystem onto your local
filesystem. For example, the `read-yaml` includes the following: `-v $(pwd):/source`.  This connects
>>>>>>> f934d5f... Wordsmithing and clarifying the readme
the container's `/source` directory to the current directory on your filesystem.
- `-i`: This flag keeps STDIN open for use in pipelines.

#### Example

Let's demo the `label_namespace.ts` function.  Find the source [here][label-namespace].

Begin by running the function with the `--help` option:

```sh
node dist/label_namespace_run.js --help
```

This provides guidance on how to use the function, much like any unix program.

`label_namespace` is configured with a `functionConfig` of kind `ConfigMap`.  It takes the keys
`label_name` and `label_value`.  Let's create a `ConfigMap` with those keys and values of our
choice, writing it to `/tmp/fc.yaml`:

```sh
cat > /tmp/fc.yaml <<EOF
apiVersion: v1
kind: ConfigMap
data:
  label_name: color
  label_value: orange
metadata:
  name: my-config
EOF
```

Next, we'll need some configuration to mutate.  As our source config, we'll use the following,
written to `tmp/input.yaml`:

```sh
cat > /tmp/input.yaml <<EOF
apiVersion: v1
kind: List
items:
- apiVersion: v1
  kind: Namespace
  metadata:
    name: audit
    annotations:
      config.kubernetes.io/path: audit/namespace.yaml
      config.kubernetes.io/index: '0'
- apiVersion: v1
  kind: Namespace
  metadata:
    name: shipping-dev
    annotations:
      config.kubernetes.io/path: shipping-dev/namespace.yaml
      config.kubernetes.io/index: '0'
- apiVersion: v1
  kind: ResourceQuota
  metadata:
    name: rq
    namespace: shipping-dev
    annotations:
      config.kubernetes.io/path: shipping-dev/resource-quota.yaml
      config.kubernetes.io/index: '0'
  spec:
    hard:
      cpu: 100m
      memory: 100Mi
      pods: '1'
EOF
```
This `List` object defines two Namespaces and a ResourceQuota.  In a dockerized pipeline of
kpt-functions, we'd read the file in via a [source function](#source-function) like `read-yaml`.

For development purposes, we'll run `label_namespace` in isolation using `node`.  This allows us
to interact with the function more easily:

```sh
node dist/label_namespace_run.js -i /tmp/input.yaml -f /tmp/fc.yaml
```

In the function's output, you'll see that the Namespaces now have the label `color: orange`.

Passing key/value pairs as parameters to your function is a common pattern, and we recommend
using `functionConfig` of type `ConfigMap` as demonstrated above.

Key/value pairs can also be passed in directly from the command line, like so:

```sh
node dist/label_namespace_run.js -i /tmp/input.yaml -d label_name=color -d label_value=orange
```

### Using `kustomize config run`

KPT functions can be run using `kustomize` as [documented here][kustomize-run].

[img-func]: docs/func.png
[img-pipeline]: docs/pipeline.png
[img-source]: docs/source.png
[img-sink]: docs/sink.png
[spec]: https://github.com/frankfarzan/kustomize/blob/functions-doc/cmd/config/docs/api-conventions/functions-spec.md
[demo-funcs]: https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/demo-functions/src
[label-namespace]: https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/demo-functions/src/label_namespace.ts
[catalog]: https://github.com/GoogleContainerTools/kpt-functions-catalog
[configs-api]: https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/kpt-functions/src/types.ts
[vscode]: https://code.visualstudio.com/
[kustomize-run]: https://github.com/frankfarzan/kustomize/blob/functions-doc/cmd/config/docs/api-conventions/functions-impl.md
[npm-packages]: https://github.com/GoogleContainerTools/kpt-functions-sdk/packages
[download-node]: https://nodejs.org/en/download/
[download-kind]: https://github.com/kubernetes-sigs/kind
[install-node]: https://github.com/nodejs/help/wiki/Installation
[install-docker]: https://docs.docker.com/v17.09/engine/installation
[beta-feature]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.15.md#customresourcedefinition-openapi-publishing
