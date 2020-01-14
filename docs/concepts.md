# Concepts

## Function

At a high level, a function can be conceptualized like so:

![function][img-func]

- `FUNC`: A program, packaged as a docker container, that performs CRUD (Create, Read, Update,
  Delete) operations on the input.
- `input`: A Kubernetes List type containing objects to operate on.
- `output`: A Kubernetes List type containing the resultant Kubernetes objects.
- `functionConfig`: An optional Kubernetes object used to parameterize the function's behavior.

See [Configuration Functions Specification][spec] for further details.

There are two special-case functions:

## Source Function

A Source Function takes no `input`:

![source][img-source]

Instead, the function typically produces the `output` by reading configurations from an external
system (e.g. reading files from a filesystem).

## Sink Function

A Sink Function produces no `output`:

![sink][img-sink]

Instead, the function typically writes configurations to an external system (e.g. writing files to a filesystem).

## Pipelines

Functions can be composed into a pipeline:

![pipeline][img-pipeline]

[spec]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
[img-func]: func.png
[img-pipeline]: pipeline.png
[img-source]: source.png
[img-sink]: sink.png
