# KPT Functions

Using KPT Functions Typescript SDK, it is easy to implement [Configuration Functions][0].
The framework provides a simple, yet powerful API for querying and manipulating configuration
files and provides all the scaffolding required to develop, build, test, and publish functions so
the user can focus on implementing their business-logic.

## Using Typescript SDK

### Required Dependencies

- [npm](https://www.npmjs.com/get-npm)
- [docker](https://docs.docker.com/v17.09/engine/installation/)

### Required Kubernetes Feature

For the type generation to work, you need this
[beta feature](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.15.md#customresourcedefinition-openapi-publishing).

If using GKE, this feature is available using an alpha cluster:

```console
gcloud container clusters create $USER-1-14-alpha --enable-kubernetes-alpha --cluster-version=latest --region=us-central1-a --project <PROJECT>
gcloud container clusters get-credentials $USER-1-14-alpha --zone us-central1-a --project <PROJECT>
```

### Create the NPM package

`create-kpt-functions` NPM package is the CLI for creating and managing NPM packages containing one or more KPT functions.

To start a new NPM package, run the following and follow the instructions and prompts:

```console
mkdir my-package
cd my-package
npm init kpt-functions
```

**Note:** Going forward, all the commands are assumed to be run from `my-package` directory.

This will create the following files:

1. `package.json` that has `kpt-functions` library as its only `dependencies` . Everything required to compile, lint and test a KPT function is declared as `devDependencies` .
2. `src/` directory containing function source files:

   - `my_func.ts`: This is where you implement the function interface.
   - `my_func_test.ts`: This is where you add your unit test.
   - `my_func_run.ts`: The entry point that runs the function.

3. `src/gen/` directory containing Kubernetes core and CRD types generated from the OpenAPI spec published by the cluster you selected.

Run the following command to install all the dependencies and build the functions:

```console
npm install
```

### Implementing the function

You can now start implementing the function using your favorite IDE, e.g. [VSCode][3]:

```console
code .
```

In `src/my_func.ts` you need to implement this simple interface:

```ts
/**
 * Interface describing KPT functions.
 */
export interface KptFunc {
  /**
   * A function reads and potentially mutates configs using the Configs document store API.
   *
   * Returns a ConfigError if there are non-exceptional issues with the configs.
   * For operational errors such as IO operation failures, throw errors instead of returning a ConfigError.
   */
  (configs: Configs): void | ConfigError;

  /**
   * Usage message describing what the function does, how to use it, and how to configure it.
   */
  usage: string;
}
```

[Configs][2] parameter is a document store for Kubernetes objects populated from/to configuration files. It enables performing rich query and mutation operations.

Take a look at [these example functions][1] to better understand how to use `kpt-functions` framework.

To build the package:

```console
npm run build
```

To build in interactive mode:

```console
npm run watch
```

To run the tests:

```console
npm test
```

### Running a KPT function during development

You can run a KPT function on an existing directory of YAML configs.

The general form is:

```console
npm run local -- my_func --source_dir=[source_dir] --sink_dir=[sink_dir] [PARAMS]
```

where parameters are of the form:

```console
--param1=value1 --param2=value2
```

Sample usage below. The '--' before arguments passed to the script are required.

```console
npm run local -- validate_rolebinding --source_dir=path/to/configs/dir/ --sink_dir=output-dir/ --subject_name=alice@foo-corp.com
```

You can choose to overwrite source YAML files by passing `--overwrite`.

```console
npm run local -- validate_rolebinding --source_dir=path/to/configs/dir/ --overwrite --subject_name=alice@foo-corp.com
```

If `--sink_dir` is defined, overwrites YAML files in `--sink_dir`.
If `--sink_dir` is not defined, overwrites YAML files in `--source_dir`.

If enabled, recursively looks for all YAML files in the directory to overwrite.

1. If would write KubernetesObjects to a file that does not exist, creates the file.
2. If would modify the contents of a file, modifies the file.
3. If would not modify the contents of a YAML file, does nothing.
4. If would write no KubernetesObjects to a file, deletes the YAML file if it exists.

### Adding a new KPT function

To add a new KPT functions to an existing package, run:

```console
npm run add-function
```

### Regenerating client types

If want to regenerate classes for core and CRD types that exist on one of your clusters:

```console
npm run update-generated-types
```

### Publishing functions

To build and push docker images for all the functions in the package:

```console
npm run publish-functions
```

This uses the `docker_repo_base` from `package.json` file and configured during initialization. The default value for docker image tag is `dev`. This can be overriden using`--tag` flag:

```console
npm run publish-functions -- --tag=latest
```

## Running KPT functions

### Using `docker run`

After `publish-functions` completes, you can now run the function using `docker run`:

```console
docker run my-docker-repo/my-func:dev --help
```

Functions can be piped to form sophisticated pipelines, for example:

```console
git clone git@github.com:frankfarzan/foo-corp-configs.git

docker pull gcr.io/kpt-functions/source-yaml-dir
docker pull gcr.io/kpt-functions/recommend-psp
docker pull gcr.io/kpt-functions/hydrate-anthos-team
docker pull gcr.io/kpt-functions/validate-rolebinding
docker pull gcr.io/kpt-functions/sink-yaml-dir

docker run -i -u $(id -u) -v $(pwd)/foo-corp-configs:/source  gcr.io/kpt-functions/source-yaml-dir --input /dev/null --source_dir /source |
docker run -i gcr.io/kpt-functions/recommend-psp |
docker run -i gcr.io/kpt-functions/hydrate-anthos-team |
docker run -i gcr.io/kpt-functions/validate-rolebinding --subject_name alice@foo-corp.com |
docker run -i -u $(id -u) -v $(pwd)/foo-corp-configs:/sink gcr.io/kpt-functions/sink-yaml-dir --sink_dir /sink --output /dev/null --overwrite true
```

Let's walk through each step:

1. Clone the `foo-corp-configs` repo containing example configs.
1. Pull all the docker images.
1. `source-yaml-dir` function recursively **reads** all YAML files from `foo-corp-configs` directory on the host.
   It outputs the content of the directory in a standard format to `stdout`. By default, docker containers
   runs as a non-privileged user. You need to specify `-u` with your user id to access host files as shown above.
1. `recommend-psp` function reads the output of `source-yaml-dir` from `stdin`. This function **mutates** any `PodSecurityPolicy` resources by setting a field called `allowPrivilegeEscalation` to `false`.
1. `hydrate-anthos-team` function similarly operates on the result of the previous function. It looks
   for Kubernetes custom resource of kind `Team`, and based on that **generates** new resources (e.g. `Namespaces` and `RoleBindings`).
1. `validate-rolebinding` function **enforces** a policy that disallows any `RoleBindings` with `subject`
   set to `alice@foo-corp.com`. This steps fails with a non-zero exit code if this policy is violated.
1. `sink-yaml-dir` **writes** the result of the pipeline back to `foo-corp-configs` directory on the host.

Let's see what changes were made to the repo:

```console
cd foo-corp-configs
git status
```

You should see these changes:

1. `podsecuritypolicy_psp.yaml` should have been mutated by `recommend-psp` function.
1. `payments-dev` and `payments-prod` directories created by `hydrate-anthos-team` function.

### Using `kustomize config run`

KPT functions can be run using `kustomize` as [documented here][4].

### Using Workflow Orchestrators

`publish-functions` also generates corresponding custom resources for running your functions using different workflow orchestrators. Currently, the following are supported:

- [Argo Workflow](https://github.com/argoproj/argo/blob/master/examples/README.md)
- [Tekton Task](https://github.com/tektoncd/pipeline/tree/master/docs/README.md)

[0]: https://github.com/frankfarzan/kustomize/blob/functions-doc/cmd/config/docs/api-conventions/functions-spec.md
[1]: https://github.com/GoogleContainerTools/kpt-functions-catalog/tree/master/latest-functions/src
[2]: https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/kpt-functions/src/types.ts
[3]: https://code.visualstudio.com/
[4]: https://github.com/frankfarzan/kustomize/blob/functions-doc/cmd/config/docs/api-conventions/functions-impl.md
