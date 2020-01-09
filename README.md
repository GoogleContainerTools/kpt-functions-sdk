# KPT Functions

KPT Functions are client-side programs that operate on Kubernetes configuration files.

Example use cases:

- **Configuration Compliance:** e.g. Require all `Namespace` configurations to have a `cost-center` label.
- **Configuration Generation:** e.g. Provide a blueprint for new services by generating a `Namespace` with organization-mandated defaults for `RBAC`, `ResourceQuota`, etc.
- **Configuration Mutation/Migration:** e.g. Change a field in all `PodSecurityPolicy` configurations to make them more secure.

KPT functions can be run as a one-off or run as part of a CI/CD pipeline.
With GitOps workflows, KPT functions read and write configuration files from a Git repo. Changes
to the system authored by humans and mutating KPT functions are reviewed before being committed to the repo. KPT functions
can be run as pre-commit or post-commit steps to check for compliance before configurations are
applied to a cluster.

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

- **Configuration is data:** Many configuration tools conflate data and operations on that data
  (e.g. YAML files embedding a templating language).
  As the configuration becomes complex, it becomes hard to read and understand intent.
  Our design philosophy is to have a clean separation
  between human-readable data and the state-less programs that manipulate this data.
  We call these programs `functions`.
- **Unix philosophy:** Functions should be small, reusable, and composable.
  By implementing the [Configuration Functions Specification][spec],
  we can develop an ever-growing catalog of useful functions which are interoperable.

## Why a Typescript SDK

We provide an opinionated Typescript SDK for implementing functions for the following reasons:

- **General-purpose language:** Many Domain-Specific languages start off with a small feature set,
  but over time, grow more complex or even become turing-complete in order to accommodate different use cases.
  After a certain amount of complexity, you are better of using a general-purpose language to get the benefits of:
  - Proper abstractions and well thought-out language features
  - Large, existing ecosystem of tooling (e.g. IDE support)
  - Large, existing catalog of well-supported libraries
  - Community support and good documentation
- **Type-safety:** Kubernetes configuration are typed, and their schema defined using the OpenAPI spec.
  Typescript has a sophisticated type system that makes dealing with Kubernetes objects easier and safer.
  The SDK enables generating Typescript classes for core and CRD types.
- **Batteries-included:** The SDK provides a simple, yet powerful [document store][document-store] API for querying and manipulating configuration
  files and provides all the scaffolding required to develop, build, test, and publish functions so
  you can focus on implementing your business-logic.

## Concepts

### Function

At a high level a function can be conceptualized like this:

![function][img-func]

- `FUNC`: A program, packaged as a docker container, that performs CRUD (Create, Read, Update, Delete) on the input.
- `input`: A List type containing the Kubernetes objects to operate on.
- `output`: A List type containing the resultant Kubernetes objects.
- `functionConfig`: An optional Kubernetes object used to used to parameterize the function's behavior.

See [Configuration Functions Specification][spec] for details.

There are two special cases functions:

### Source Function

A source function takes no `input`:

![source][img-source]

Instead, the function typically produces the `output` by reading configurations from an external
system (e.g. reading files from a filesystem).

### Sink Function

A sink function produces no `output`:

![sink][img-sink]

Instead, the function typically writes configurations to an external system (e.g. writing files to a filesystem).

### Pipeline

Functions can be composed into a pipeline:

![pipeline][img-pipeline]

## Developing KPT Functions

This section covers how to use the Typescript SDK to develop KPT functions.

### System Requirements

Current release requires x86 64-bit Linux. Other platforms will be supported in 1.0.0 release.

#### Local Environment

- Install [node][download-node]
  - SDK requires npm version 6 or higher.
  - If downloading binaries, follow these [installation instructions][install-node].
- Install [docker][install-docker]

##### `.npmrc` file

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

#### Kubernetes Cluster

For the type generation feature to work, you need a Kubernetes cluster with this [beta feature][beta-feature].

##### Using a `Kind` cluster

The easiest way is to use `Kind` to bring up a local cluster running as a docker container.

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

##### Working with CRDs

If your function uses a Custom Resource Definition, make sure you apply it to the cluster at
this point:

```sh
kubectl apply -f /path/to/my/crd.yaml
```

### Create the NPM package

To start a new NPM package, run the following and follow the instructions and prompts:

```sh
mkdir my-package
cd my-package
npm init @googlecontainertools/kpt-functions
```

> **Note:** Going forward, all the commands are assumed to be run from `my-package` directory.

This will create the following files:

1. `package.json`: Declares `kpt-functions` framework library as the only item in `dependencies`.
   Everything required to compile, lint and test a KPT function is declared as `devDependencies`,
   including the `create-kpt-functions` CLI discussed later.
1. `src/`: Contains the source files for all your functions, e.g.:

   - `my_func.ts`: This is where you implement the function interface.
   - `my_func_test.ts`: This is where you add your unit test.
   - `my_func_run.ts`: The main entry point that runs the function.

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

[Configs][configs-api] parameter is an in-memory document store for Kubernetes objects populated from/to configuration files.
It enables performing rich query and mutation operations.

Take a look at [these example functions][demo-funcs] to better understand how to use `kpt-functions` library. These functions are available as docker images documented in the [catalog][catalog].

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

You need to have proper authentication/authorization to be able to push to the registry using
the credentials used by `docker push`.

This uses the `kpt.docker_repo_base` field in `package.json` which was set during package creation.
You can manually edit this field at any time.
The default value for docker image tag is `dev`. This can be overridden using`--tag` flag:

```sh
npm run kpt:docker-build -- --tag=latest
npm run kpt:docker-push -- --tag=latest
```

### SDK CLI

`create-kpt-functions` package which was installed as a `devDependencies` provides the `kpt` CLI binary
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
npm run kpt:function-create -- --help
```

> **Note:** Flags are passed to the CLI after `--` separator.

## Running KPT functions

KPT functions can be executed using different orchestrators. This section covers two ways of running
functions:

1. Directly using `docker run`
1. Using `kustomize config`

### Using `docker run`

Following steps above, you have a function that can be run locally using `node`:

```sh
node dist/my_func_run.js --help
```

or as a docker container:

```sh
docker run gcr.io/kpt-functions-demo/my-func:dev --help
```

But how do you read and write configuration files?

You need to use [source and sink functions](#source-function), for example, `read-yaml` and `write-yaml`
functions from the [KPT functions catalog][catalog].

1. Pull function images:

   ```sh
   docker pull gcr.io/kpt-functions/read-yaml
   docker pull gcr.io/kpt-functions/write-yaml
   ```

1. Using a configs directory, e.g.:

   ```sh
   git clone git@github.com:GoogleContainerTools/kpt-functions-sdk.git
   cd kpt-functions-sdk/example-configs
   ```

1. Run `read-yaml` function, and look at its output by piping to `less` command:

   ```sh
   docker run -i -u $(id -u) -v $(pwd):/source  gcr.io/kpt-functions/read-yaml -i /dev/null -d source_dir=/source |
   less
   ```

1. Pipe the output of `read-yaml` to your function and look at its output:

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

#### Docker flags

- `-u`: By default, docker containers runs as a non-privileged user. You need to specify a privileged user id if the function needs access to host filesystem or makes network calls for example.
- `-v`: You need to specify a volume mount if the function needs access to the host filesystem. For example, `read-yaml` function reads
  the git repo mounted to `/source` directory in the container.
- `-i`: Needed when using pipes to be able to consume from stdin.

#### Example 1

Let's take a look at `label_namespace.ts` [source here][label-namespace].

Its help message tells us how to configure and run the function:

```sh
docker run gcr.io/kpt-functions/label-namespace --help
```

This functions takes a `functionConfig` of kind `ConfigMap` which specifies label key/value to apply
to all `Namespaces` in the input.

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

When you run the function, you should see `audit` and `shipping-dev` Namespaces will be labelled
with `color: orange`:

```sh
docker run -i gcr.io/kpt-functions/label-namespace < /tmp/input.yaml
```

##### functionConfig from a file

Alternatively, the `functionConfig` can be specified as a separate file:

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

```sh
docker run -i -u $(id -u) -v /tmp/fc.yaml:/tmp/fc.yaml gcr.io/kpt-functions/label-namespace -f /tmp/fc.yaml < /tmp/input2.yaml
```

##### functionConfig from literal values

It's common for functions to use a `ConfigMap` to provide a simple list of key/value pairs as parameters. We provide porcelain to make this easier. This is functionally equivalent to the invocation above:

```sh
docker run -i gcr.io/kpt-functions/label-namespace -d label_name=color -d label_value=orange < /tmp/input2.yaml
```

> **Note:** This causes an error if the function takes another kind of `functionConfig`.

Finally, let's mutate the configuration files by using a source and sink function:

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

First, grab `example-configs` directory and pull the docker images:

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

1. `read-yaml` function recursively reads all YAML files from `foo-corp-configs` directory on the host.
1. `mutate-psp` function reads the output of `read-yaml`. This function **mutates** any `PodSecurityPolicy` resources by setting a field called `allowPrivilegeEscalation` to `false`.
1. `expand-team-cr` function similarly operates on the result of the previous function. It looks
   for Kubernetes custom resource of kind `Team`, and based on that **generates** new resources (e.g. `Namespaces` and `RoleBindings`).
1. `validate-rolebinding` function **enforces** a policy that disallows any `RoleBindings` with `subject`
   set to `alice@foo-corp.com`. This steps fails with a non-zero exit code if this policy is violated.
1. `write-yaml` writes the result of the pipeline back to `foo-corp-configs` directory on the host.

Let's see what changes were made to the repo:

```sh
git status
```

You should see these changes:

1. `podsecuritypolicy_psp.yaml` should have been mutated by `mutate-psp` function.
1. `payments-dev` and `payments-prod` directories created by `expand-team-cr` function.

### Using `kustomize config`

`kustomize config` provides utilities for working with configuration including running functions.

#### Downloading `kustomize`

1. Download the `kustomize` binary [here][download-kustomize].
1. Enable alpha commands:

   ```sh
   export KUSTOMIZE_ENABLE_ALPHA_COMMANDS=true
   ```

#### Example 1

```sh
git clone git@github.com:GoogleContainerTools/kpt-functions-sdk.git
cd kpt-functions-sdk/example-configs
```

`config source` and `config sink` sub-commands are implementations of a [source and sink functions](#source-function)

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

You should see the same results:

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
