# KPT Functions
![](https://github.com/GoogleContainerTools/kpt-functions-sdk/workflows/CI/badge.svg)

KPT Functions are client-side programs that operate on Kubernetes configuration files.

Example use cases:

- **Configuration Compliance:** e.g. Require all `Namespace` configurations to have a `cost-center` label.
- **Configuration Generation:** e.g. Provide a blueprint for new services by generating a `Namespace` with organization-mandated defaults for `RBAC`, `ResourceQuota`, etc.
- **Configuration Mutation/Migration:** e.g. Change a field in all `PodSecurityPolicy` configurations to make them more secure.

KPT functions can be run as one-off functions or as part of a CI/CD pipeline.

In GitOps workflows, KPT functions read and write configuration files from a Git repo. Changes
to the system authored by humans and mutating KPT functions are reviewed before being committed to the repo. KPT functions
can be run as pre-commit or post-commit steps to check for compliance before configurations are
applied to a cluster.

In CI/CD, KPT Functions can validate your configuration before committing.  Many production outages
are caused by misconfiguration, with code review serving as the only config validation.  KPT Functions
can programmatically enforce standards and practices, building safety into your infrastructure
development flow.

## Table of Contents

- [Why KPT Functions](#why-kpt-functions)
- [Why a Typescript SDK](#why-a-typescript-sdk)
- [Concepts](#concepts)
  - [Function](#function)
  - [Source Function](#source-function)
  - [Sink Function](#sink-function)
  - [Pipeline](#pipeline)
- [Developing KPT functions](#developing-kpt-functions)
  - [System Requirements](#system-requirements)
    - [Local Environment](#local-environment)
      - [`.npmrc` file](#npmrc-file)
    - [Kubernetes Cluster](#kubernetes-cluster)
      - [Using a `Kind` cluster](#using-a-kind-cluster)
      - [Using a GKE cluster](#using-a-gke-cluster)
      - [Working with CRDs](#working-with-crds)
  - [Create the NPM package](#create-the-npm-package)
  - [Implementing the function](#implementing-the-function)
  - [Container images](#container-images)
  - [SDK CLI](#sdk-cli)
- [Running KPT functions](#running-kpt-functions)
  - [Using `docker run`](#using-docker-run)
    - [Docker flags](#docker-flags)
    - [Example 1](#example-1)
      - [functionConfig as part of input](#functionconfig-as-part-of-input)
      - [functionConfig from a file](#functionconfig-from-a-file)
      - [functionConfig from literal values](#functionconfig-from-literal-values)
    - [Example 2](#example-2)
  - [Using `kustomize config`](#using-kustomize-config)

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
  feature set, but often grow over time.  They bloat in order to accommodate the tremendous variety
  of customer use cases. Rather than follow this same course, KPT functions employ a true,
  general-purpose programmaing language that provides:
  - Proper abstractions and language features
  - A extensive ecosystem of tooling (e.g. IDE support)
  - A comprehensive catalog of well-supported libraries
  - Robust community support and detailed documentation
- **Type-safety:** Kubernetes configuration is typed, and its schema is defined using the OpenAPI spec.
  Typescript has a sophisticated type system that accomodates the complexity of Kubernetes resources.
  The SDK enables generating Typescript classes for core and CRD types, providing safe and easy
  interaction with Kubernetes objects.
- **Batteries-included:** The SDK provides a simple, powerful API for querying and manipulating configuration
  files. It provides the scaffolding required to develop, build, test, and publish functions,
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

### Source Functions

A Source Function takes no `input`:

![source][img-source]

Instead, the function typically produces the `output` by reading configurations from an external
system (e.g. reading files from a filesystem).

### Sink Functions

A Sink Function produces no `output`:

![sink][img-sink]

Instead, the function typically writes configurations to an external system (e.g. writing files to a filesystem).

### Pipelines

Functions can be composed into a pipeline:

![pipeline][img-pipeline]

## Developing KPT Functions

This section covers how to use the Typescript SDK to develop KPT functions.

### System Requirements

Supported platforms: amd64 Linux/Mac/Windows

#### Setting Up Your Local Environment

- Install [node][download-node]
  - The SDK requires `npm` version 6 or higher.
  - If installig node from binaries (i.e. without a package manager), follow these
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

### Working with CRDs

If your function uses a Custom Resource Definition, make sure you apply it to the cluster before
generating the SDK.  Typescript uses the k8s server to generate the types represented there,
including your CRD.

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

> **Note:** All subsequent commands are run from the `my-package/` directory.

`npm init` will create the following files:

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
to help develop new functions.  It includes commands to create, build, publish, and more:

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
npm run kpt:function-create -- --help
```

> **Note:** Flags are passed to the CLI after the `--` separator.

## Running KPT functions

KPT functions can be executed using different orchestrators. This section covers two ways of running
functions:

1. Directly using `docker run`
1. Using `kustomize config`

### Using `docker run`

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
   git clone git@github.com:GoogleContainerTools/kpt-functions-sdk.git
   cd kpt-functions-sdk/example-configs
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
- `-v`: Filesystem access requires mounting your container's filesystem onto your local
filesystem. For example, the `read-yaml` command includes the following: `-v $(pwd):/source`.  This connects
the container's `/source` directory to the current directory on your filesystem.
- `-i`: This flag keeps STDIN open for use in pipelines.

#### Example 1

Let's demo the `label_namespace.ts` function.  Find the source [here][label-namespace].

Begin by running the function with the `--help` option:

```sh
docker run gcr.io/kpt-functions/label-namespace --help
```

The `label_namespace` function is configured with a `functionConfig` of kind `ConfigMap`.  It takes the keys
`label_name` and `label_value`.  The function adds the label `[label_name]: [label_value]` to the
`Namespace` objects in the input.

##### functionConfig as part of input

[Configuration Functions Specification][spec] allow specifying functionConfig as part of the input
resource as such:

```sh
cat > /tmp/input.yaml <<EOF
apiVersion: v1
kind: ResourceList
functionConfig:
  apiVersion: v1
  kind: ConfigMap
  data:
    label_name: color
    label_value: orange
  metadata:
    name: my-config
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

When you run the function:

```sh
docker run -i gcr.io/kpt-functions/label-namespace < /tmp/input.yaml
```

you should see the `audit` and `shipping-dev` Namespaces now include the label `color: orange`.

##### functionConfig from a file

Alternatively, the `functionConfig` can be specified as its own file:

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

separate from the input configuration data:

```sh
cat > /tmp/input2.yaml <<EOF
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
For now, we'll use a bash redirection:

```sh
docker run -i -u $(id -u) -v /tmp/fc.yaml:/tmp/fc.yaml gcr.io/kpt-functions/label-namespace -f /tmp/fc.yaml < /tmp/input2.yaml
```

##### functionConfig from literal values

Key/value parameters can also be assigned inline, like so:

```sh
docker run -i gcr.io/kpt-functions/label-namespace -d label_name=color -d label_value=orange < /tmp/input2.yaml
```

This is functionally equivalent to the `ConfigMap` used earlier.

> **Note:** This causes an error if the function takes another kind of `functionConfig`.

Finally, let's mutate the configuration files by using source and sink functions:

```sh
git clone git@github.com:GoogleContainerTools/kpt-functions-sdk.git
cd kpt-functions-sdk/example-configs

docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
docker run -i gcr.io/kpt-functions/label-namespace -d label_name=color -d label_value=orange |
docker run -i -u $(id -u) -v $(pwd):/sink gcr.io/kpt-functions/write-yaml -o /dev/null -d sink_dir=/sink -d overwrite=true
```

You should see labels added to `Namespace` configuration files:

```sh
git status
```

#### Example 2

Functions can be piped to form sophisticated pipelines.

First, grab the `example-configs` directory and pull the docker images:

```sh
git clone git@github.com:GoogleContainerTools/kpt-functions-sdk.git
cd kpt-functions-sdk/example-configs

docker pull gcr.io/kpt-functions/read-yaml
docker pull gcr.io/kpt-functions/mutate-psp
docker pull gcr.io/kpt-functions/expand-team-cr
docker pull gcr.io/kpt-functions/validate-rolebinding
docker pull gcr.io/kpt-functions/write-yaml
```

Run these functions:

```sh
docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
docker run -i gcr.io/kpt-functions/mutate-psp |
docker run -i gcr.io/kpt-functions/expand-team-cr |
docker run -i gcr.io/kpt-functions/validate-rolebinding -d subject_name=alice@foo-corp.com |
docker run -i -u $(id -u) -v $(pwd):/sink gcr.io/kpt-functions/write-yaml -o /dev/null -d sink_dir=/sink -d overwrite=true
```

Let's walk through each step:

1. `read-yaml` recursively reads all YAML files from the `foo-corp-configs` directory on the host.
1. `mutate-psp` reads the output of `read-yaml`. This function **mutates** any `PodSecurityPolicy`
resources by setting the `allowPrivilegeEscalation` field to `false`.
1. `expand-team-cr` similarly operates on the result of the previous function. It looks
   for Kubernetes custom resource of kind `Team`, and **generates** new resources based on that
   (e.g. `Namespaces` and `RoleBindings`).
1. `validate-rolebinding` **enforces** a policy that disallows any `RoleBindings` with `subject`
   set to `alice@foo-corp.com`. This steps fails with a non-zero exit code if the policy is violated.
1. `write-yaml` writes the result of the pipeline back to the `foo-corp-configs` directory on the host.

Let's see what changes were made to the repo:

```sh
git status
```

You should see the following changes:

1. An updated `podsecuritypolicy_psp.yaml`, mutated by the `mutate-psp` function.
1. The `payments-dev` and `payments-prod` directories, created by `expand-team-cr` function.

### Using `kustomize config`

`kustomize config` provides utilities for working with configuration, including running KPT functions.

#### Downloading `kustomize`

1. Download the `kustomize` binary [here][download-kustomize].
1. Enable alpha commands:

   ```sh
   export KUSTOMIZE_ENABLE_ALPHA_COMMANDS=true
   ```

#### Example

```sh
git clone git@github.com:GoogleContainerTools/kpt-functions-sdk.git
cd kpt-functions-sdk/example-configs
```

The `config source` and `config sink` sub-commands are implementations of [source and sink functions](#source-function)

```sh
kustomize config source . |
docker run -i gcr.io/kpt-functions/label-namespace -d label_name=color -d label_value=orange |
kustomize config sink .
```

You should see labels added to `Namespace` configuration files:

```sh
git status
```

Using `config run`, you can declare a function and its `functionConfig` like any other configuration
file:

```sh
cat << EOF > kpt-func.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  annotations:
    config.k8s.io/function: |
      container:
        image:  gcr.io/kpt-functions/label-namespace
    config.kubernetes.io/local-config: "true"
data:
  label_name: color
  label_value: orange
EOF
```

You should see the same results as in the previous examples:

```sh
kustomize config run .
git status
```

You can have multiple function declarations in a directory. Let's add a second function:

```sh
cat << EOF > kpt-func2.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  annotations:
    config.k8s.io/function: |
      container:
        image:  gcr.io/kpt-functions/validate-rolebinding
    config.kubernetes.io/local-config: "true"
data:
  subject_name: bob@foo-corp.com
EOF
```

`config run` executes both functions:

```sh
kustomize config run .
```

In this case, `validate-rolebinding` will find policy violations and fail with a non-zero exit code.

To see help message for details:

```sh
kustomize config run --help
```

[img-func]: docs/func.png
[img-pipeline]: docs/pipeline.png
[img-source]: docs/source.png
[img-sink]: docs/sink.png
[spec]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
[kustomize-run]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-impl.md
[demo-funcs]: https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/demo-functions/src
[label-namespace]: https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/demo-functions/src/label_namespace.ts
[catalog]: https://github.com/GoogleContainerTools/kpt-functions-catalog
[configs-api]: https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/kpt-functions/src/types.ts
[vscode]: https://code.visualstudio.com/
[npm-packages]: https://github.com/GoogleContainerTools/kpt-functions-sdk/packages
[download-node]: https://nodejs.org/en/download/
[download-kind]: https://github.com/kubernetes-sigs/kind
[download-kustomize]: https://storage.googleapis.com/kpt-temp/kustomize
[install-node]: https://github.com/nodejs/help/wiki/Installation
[install-docker]: https://docs.docker.com/v17.09/engine/installation
[beta-feature]: https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.15.md#customresourcedefinition-openapi-publishing
[document-store]: https://en.wikipedia.org/wiki/Document-oriented_database
