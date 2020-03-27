---
title: "Concepts"
type: docs
weight: 2
menu:
  main:
    weight: 2
---

## Function

At a high level, a function can be conceptualized like so:

{{< png src="images/func" >}}

- `FUNC`: A program, packaged as a container, that performs CRUD (Create, Read, Update,
  Delete) operations on the input.
- `input`: A Kubernetes List type containing objects to operate on.
- `output`: A Kubernetes List type containing the resultant Kubernetes objects.
- `functionConfig`: An optional Kubernetes object used to parameterize the function's behavior.

See [Configuration Functions Specification][spec] for further details.

There are two special-case functions: source functions and sink functions.

## Source Function

A Source Function takes no `input`:

{{< png src="images/source" >}}

Instead, the function typically produces the `output` by reading configurations from an external
system (e.g. reading files from a filesystem).

## Sink Function

A Sink Function produces no `output`:

{{< png src="images/sink" >}}

Instead, the function typically writes configurations to an external system (e.g. writing files to a filesystem).

## Pipeline

Functions can be composed into a pipeline:

{{< png src="images/pipeline" >}}

## Next Steps

- [Developing KPT Functions](../develop)
- [Running KPT Functions](../run)

[spec]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
