# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Community Guidelines

This project follows
[Google's Open Source Community Guidelines](https://opensource.google.com/conduct/).

## Additional Notes

The following sections give additional tips and best practices when submitting changes.

### Adding an NPM dependency

When adding a new dependency (especially in `dependency`), you
need to perform due diligence.

1. Look at the transitive dependencies of the package:
   <http://npm.broofa.com/>
1. Does the package depend on a lot of dependencies?
1. What's size of the package? Will it cause binary bloat?
1. Is the package and its transitive dependencies high quality, trust-worthy, and well-maintained projects?
1. What version of the package should we depend on?
1. Are the licenses for the package and its transitive dependencies green? See next section for checking licenses.

### Checking NPM dependencies licenses

When adding any new dependencies or updating existing dependencies
we need to check licenses:

```console
npm run lint-license
```

### Releases

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
