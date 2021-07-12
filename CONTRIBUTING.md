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

The following sections give additional tips and best practices when submitting
changes.

### Adding an NPM dependency

When adding a new dependency (especially in `dependency`), you need to perform
due diligence.

1. Look at the transitive dependencies of the package: <http://npm.broofa.com/>
1. Does the package depend on a lot of dependencies?
1. What's size of the package? Will it cause binary bloat?
1. Is the package and its transitive dependencies high quality, trust-worthy,
   and well-maintained projects?
1. What version of the package should we depend on?
1. Are the licenses for the package and its transitive dependencies green? See
   next section for checking licenses.

### Checking NPM dependencies licenses

When adding any new dependencies or updating existing dependencies we need to
check licenses:

```console
npm run lint-license
```

### Local development

When developing locally, you often want to use the the local modified version of
NPM packages (`kpt-functions` and `create-kpt-functions`) used by function
packages (e.g. `demo-functions`). You can do the following:

```console
cd ts/demo-functions
# May need to run as `sudo` depending on how you intalled NPM
npm link ../kpt-functions
npm run build
```

### Releases

This repo contains two NPM packages that are published to the NPM registry.

#### `kpt-functions`

This is the library used by all TS SDK functions.

##### NPM registry

https://www.npmjs.com/package/kpt-functions

##### Release candidates

Before releasing major changes, or whenever you want additinal verification, first create a `rc` release:

1.  In pristine git repo, run:

    ```console
    ./scripts/version-kpt-functions-sdk.sh 0.14.0-rc.1
    ```

    This automatically creates a Git commit in your local repo.

2.  Create a PR and commit.
    [Example](https://github.com/GoogleContainerTools/kpt-functions-sdk/commit/d944c818f564a183c3cb092b282f5e83f770b18a)
3.  Create a release in GitHub which pushes the package to NPM registry. But,
    because this is marked as an `rc` release, it will not be pulled by default
    form the NPM registry.
    [Example](https://github.com/GoogleContainerTools/kpt-functions-sdk/releases/tag/release-kpt-functions-v0.14.0)

4.  In a separate PR, update the dependant packages

    ```console
    ./scripts/version-kpt-functions-sdk-deps.sh 0.14.0-rc.1
    ```

5.  Create a PR and commit.
    [Example](https://github.com/GoogleContainerTools/kpt-functions-sdk/commit/e1126e5a23fac3d3a79706ceaca924a9b4d31a18)
    This PR ensures that dependant packages are tested against the `rc` release.

6.  Once you are confident that the `rc` release is good, you can then repeat
    the process with out the `rc` suffix:
    ```console
    ./scripts/version-kpt-functions-sdk.sh 0.14.0
    ```
7.  In a separate PR, update the SDK API docs which are
    [hosted here](https://googlecontainertools.github.io/kpt-functions-sdk/api/)

    ```console
    cd ts/kpt-functions
    npm run gen-docs
    ```

    **NOTE**: You want to merge this PR. Do not squash or rebase this PR. The
    API docs refer to the commit SHA of the your local repo, so you want to make
    sure that commit will exist on the master branch after merging it.

#### `create-kpt-functions`

This is the CLI for TS SDK.

##### NPM registry

https://www.npmjs.com/package/create-kpt-functions

##### Release candidates

Before releasing major changes, you first want to create a `rc` release.

1.  In pristine git repo, make changes following this
    [Example](https://github.com/GoogleContainerTools/kpt-functions-sdk/pull/102/files)
    but specifying an rc suffix (e.g. `0.16.0-rc.1`)
    
    You should uprev any dependencies in [package.json template](https://github.com/GoogleContainerTools/kpt-functions-sdk/blob/master/ts/create-kpt-functions/templates/package.json.mustache). This includes the two 1st-party NPM packages as well as third-party dependencies.
2.  Create a PR and commit.
3.  Create a release in GitHub which pushes the package to NPM registry. But,
    because this is marked as an `rc` release, it will not be pulled by default
    form the NPM registry.
    [Example](https://github.com/GoogleContainerTools/kpt-functions-sdk/releases/tag/release-create-kpt-functions-v0.16.0)
4.  You can invoke the the released CLI locally:
   ```console
   npx create-kpt-functions@0.16.0-rc.1
   ```
5.  In a separate PR, update the dependant packages following this
    [Example](https://github.com/GoogleContainerTools/kpt-functions-sdk/pull/103/files)
    (Ignore workflow change)

6.  Create a PR and commit. This PR ensures that dependant packages are tested
    against the `rc` release.

7.  Once you are confident that the `rc` release is good, you can then repeat
    the process with out the `rc` suffix (e.g. `0.16.0`).
8.  You can manually the the released CLI locally:
      ```console
      # This is equivilant to npx create-kpt-functions@latest
      npm init kpt-functions
      ```
      
    However, the following script automatically invokes the CLI,
    and updates the `init-package` in the repo:

       ```console
       ./scripts/init-package.sh
       ```

#### GitHub Release Workflows

Release workflows are triggered by creating Releases in the GitHub UI with a tag
following the format:

`release-<workflow>-vX.Y.Z`

List of release workflows:

| Tag                              | Workflow                                                 |
| -------------------------------- | -------------------------------------------------------- |
| `release-kpt-functions-*`        | Publishes `kpt-functions` NPM package                    |
| `release-create-kpt-functions-*` | Publishes `create-kpt-functions` NPM package             |
| `release-demo-functions-*`       | Publishes `demo-functions` functions container images    |
| `release-gatekeeper-function-*`  | Publishes `gatekeeper-validate` function container image |
