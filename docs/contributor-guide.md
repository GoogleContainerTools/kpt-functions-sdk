# Contributor Guide

## Adding an NPM dependency

When adding a new dependency (especially in `dependency`), you
need to perform due diligence.

1. Look at the transitive dependencies of the package:
   <http://npm.broofa.com/>
1. Does the package depend on a lot of dependencies?
1. What's size of the package? Will it cause binary bloat?
1. Is the package and its transitive dependencies high quality, trust-worthy, and well-maintained projects?
1. What version of the package should we depend on?
1. Are the licenses for the package and its transitive dependencies green? See next section for checking licenses.

## Checking NPM dependencies licenses

When adding any new dependencies or updating existing dependencies
we need to check licenses:

```console
npm run lint-license
```

## Releases

Release workflows are triggered by creating Releases in the GitHub UI with a tag following the
format:

`release-<workflow>-vX.Y.Z`

List of release workflows:

| Tag                              | Workflow                                                 |
| -------------------------------- | -------------------------------------------------------- |
| `release-kpt-functions-*`        | Publishes `kpt-functions` NPM package                    |
| `release-create-kpt-functions-*` | Publishes `create-kpt-functions` NPM package             |
| `release-demo-functions-*`       | Publishes `demo-functions` functions container images    |
| `release-gatekeeper-function-*`  | Publishes `gatekeeper-validate` function container image |
