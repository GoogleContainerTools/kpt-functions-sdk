# kpt functions Contributor Guide

## Building and testing all kpt functions packages

```console
# Run the package.json scripts for validation after making changes
npm run build
npm run watch
npm test
```

## Adding a new dependency

When adding a new dependency (especially in `dependency`), you
need to perform due diligence.

1. Look at the transitive dependencies of the package:
   <http://npm.broofa.com/>
1. Does the package depend on a lot of dependencies?
1. What's size of the package? Will it cause binary bloat?
1. Is the package and its transitive dependencies high quality, trust-worthy, and well-maintained projects?
1. What version of the package should we depend on?
1. Are the licenses for the package and its transitive dependencies 'green'? See next section for checking license.

## Checking licenses

When adding any new dependencies or updating existing dependencies
we need to check licenses:

```console
npm run lint-license
```

## Building typgen binary

TO re-build typegen binary:

```console
./scripts/build-typegen.sh
```

## Generate example package

```console
./scripts/generate-example.sh
```
