# Running KPT Functions

After completing the [Development Guide](develop.md), you'll have a function that can be run locally using `node`:

```sh
node dist/my_func_run.js --help
```

or as a docker container:

```sh
docker run gcr.io/kpt-functions-demo/my-func:dev --help
```

In order do something useful with a function, we need to compose a [Pipeline][concept-pipeline] with a
Source and a Sink function.

This guide covers two approaches to running a pipeline of functions:

- [Using `kpt fn`](#using-kpt-fn)
- [Using `docker run`](#using-docker-run)

You can also use a container-based workflow orchestrator like [Cloud Build][cloud-build], [Tekton][tekton], or [Argo Workflows][argo].

## Using `kpt fn`

`kpt fn` provides utilities for working with configuration, including running KPT functions.

### Installing `kpt` CLI

Follow [installation instructions][download-kpt] to get the `kpt` CLI.

### Example

```sh
kpt pkg get git@github.com:GoogleContainerTools/kpt-functions-sdk.git/example-configs example-configs
cd example-configs
```

The `fn source` and `fn sink` sub-commands are implementations of [source and sink functions][concept-source] respectively:

```sh
kpt fn source . |
kpt fn run --image gcr.io/kpt-functions/label-namespace -- label_name=color label_value=orange |
kpt fn sink .
```

You should see labels added to `Namespace` configuration files:

```sh
git status
```

Using `fn run`, you can declare a function and its `functionConfig` like any other configuration
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
kpt fn run .
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

`fn run` executes both functions:

```sh
kpt fn run .
```

In this case, `validate-rolebinding` will find policy violations and fail with a non-zero exit code.

To see help message for details:

```sh
kpt fn run --help
```

## Using `docker run`

We can use any Source and Sink function to compose a pipeline. Here, we'll use `read-yaml` and `write-yaml`
functions from the [KPT functions catalog][catalog].

Pull the images:

```sh
docker pull gcr.io/kpt-functions/read-yaml
docker pull gcr.io/kpt-functions/write-yaml
```

You'll also need some source configuration. You can try this example configuration:

```sh
git clone --depth 1 git@github.com:GoogleContainerTools/kpt-functions-sdk.git
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

### Understanding Docker Flags

- `-u`: By default, docker containers run as a non-privileged user. Privileged actions, like
  filesystem access or calls to the network, require escalated access. Note the example usages of
  `read-yaml`, which include `docker run -u $(id -u)`, running docker with your user ID.
- `-v`: Filesystem access requires mounting your container's filesystem onto your local
  filesystem. For example, the `read-yaml` command includes the following: `-v $(pwd):/source`. This connects
  the container's `/source` directory to the current directory on your filesystem.
- `-i`: This flag keeps STDIN open for use in pipelines.

### Example 1

Let's demo the `label_namespace.ts` function. Find the source [here][label-namespace].

Begin by running the function with the `--help` option:

```sh
docker run gcr.io/kpt-functions/label-namespace --help
```

The `label_namespace` function is configured with a `functionConfig` of kind `ConfigMap`. It takes the keys
`label_name` and `label_value`. The function adds the label `[label_name]: [label_value]` to the
`Namespace` objects in the input.

#### functionConfig from a file

`functionConfig` can be specified as a file:

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

This `List` object defines two Namespaces and a ResourceQuota. In a dockerized pipeline of
kpt-functions, we'd read the file in via a source function such as `read-yaml`.
For now, we'll use a bash redirection:

```sh
docker run -i -u $(id -u) -v /tmp/fc.yaml:/tmp/fc.yaml gcr.io/kpt-functions/label-namespace -f /tmp/fc.yaml < /tmp/input2.yaml
```

#### functionConfig from literal values

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

### Example 2

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

## Next Steps

- [Try running other functions in the Catalog][catalog]

[concept-source]: concepts.md#source-function
[concept-pipeline]: concepts.md#pipeline
[catalog]: https://github.com/GoogleContainerTools/kpt-functions-catalog
[label-namespace]: https://github.com/GoogleContainerTools/kpt-functions-sdk/tree/master/ts/demo-functions/src/label_namespace.ts
[download-kpt]: https://github.com/GoogleContainerTools/kpt
[cloud-build]: https://cloud.google.com/cloud-build/
[tekton]: https://cloud.google.com/tekton/
[argo]: https://github.com/argoproj/argo
