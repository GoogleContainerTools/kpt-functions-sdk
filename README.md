# KPT Functions

KPT Functions are client-side programs that make it easy to operate on a repository of Kubernetes configuration files.

Use cases:

- **Configuration Validation:** e.g. Require all `Namespace` configurations to have a `cost-center` label.
- **Configuration Generation:** e.g. Provide a blueprint for new services by generating a `Namespace` with organization-mandated defaults for `RBAC`, `ResourceQuota`, etc.
- **Configuration Transformation:** e.g. Update all `PodSecurityPolicy` configurations to improve the
  security posture.

![demo][demo-run]

KPT functions can be run locally or as part of a CI/CD pipeline.

In GitOps workflows, KPT functions read and write configuration files from a Git repo. Changes
to the system authored by humans and mutating KPT functions are reviewed before being committed to the repo. KPT functions
can be run as pre-commit or post-commit steps to validate configurations before they are applied to a cluster.

## Next Steps

- [Learn about the concepts](docs/concepts.md)
- Develop a KPT Function using the Typescript SDK
  - [Quickstart](docs/develop-quickstart.md)
  - [Complete Guide](docs/develop.md)
- [Running KPT Functions](docs/run.md)

## FAQ

### Why KPT Functions

- **Configuration as data:** Many configuration tools conflate data with the operations on that
  data (e.g. YAML files embedding a templating language).
  As configuration becomes complex, it becomes hard to read and understand.
  Our design philosophy is to keep configuration as data, which enables us to programmatically manipulate it using stateless programs called _functions_.
- **Unix philosophy:** Functions should be small, reusable, and composable.
  By implementing the [Configuration Functions Specification][spec],
  we can develop an ever-growing catalog of useful, interoperable functions.

### Why a Typescript SDK

We provide an opinionated Typescript SDK for implementing KPT Functions. This provides various
advantages:

- **General-purpose language:** Domain-Specific Languages begin their life with a reasonable
  feature set, but often grow over time. They bloat in order to accommodate the tremendous variety
  of customer use cases. Rather than follow this same course, KPT functions employ a true,
  general-purpose programming language that provides:
  - Proper abstractions and language features
  - A extensive ecosystem of tooling (e.g. IDE support)
  - A comprehensive catalog of well-supported libraries
  - Robust community support and detailed documentation
- **Type-safety:** Kubernetes configuration is typed, and its schema is defined using the OpenAPI spec.
  Typescript has a sophisticated type system that accommodates the complexity of Kubernetes resources.
  The SDK enables generating Typescript classes for core and CRD types, providing safe and easy
  interaction with Kubernetes objects.
- **Batteries-included:** The SDK provides a simple, powerful API for querying and manipulating configuration
  files. It provides the scaffolding required to develop, build, test, and publish functions,
  allowing you to focus on implementing your business-logic.

## Community

**We'd love to hear from you!**

- [kpt-users mailing list][kpt-users]

[ci-badge]: https://github.com/GoogleContainerTools/kpt-functions-sdk/workflows/CI/badge.svg
[spec]: https://github.com/kubernetes-sigs/kustomize/blob/master/cmd/config/docs/api-conventions/functions-spec.md
[kpt-users]: https://groups.google.com/forum/#!forum/kpt-users
[demo-run]: https://storage.googleapis.com/kpt-functions/docs/run.gif
