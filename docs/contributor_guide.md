# KPT Functions Contributor Guide

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

## Releases

1. Update version in package.json to e.g. `0.10.0-rc.1`
2. Create a RC in GitHub, e.g: `release-kpt-functions-v0.10.0-rc.1`
   This will trigger a release job in GitHub actions
3. Create a PR changing dependant packages to use the rc version.
4. If the CI passes for this PR, edit release created in #2 and remove `-rc.1`.
5. Edit PR in #4 to remove `-rc.1`.
