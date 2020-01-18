[@googlecontainertools/kpt-functions](../README.md) › ["src/testing"](../modules/_src_testing_.md) › [TestRunner](_src_testing_.testrunner.md)

# Class: TestRunner

TestRunner makes it easier to write table-driven tests for KPT functions.

## Hierarchy

* **TestRunner**

## Index

### Constructors

* [constructor](_src_testing_.testrunner.md#constructor)

### Methods

* [run](_src_testing_.testrunner.md#run)

## Constructors

###  constructor

\+ **new TestRunner**(`fn`: [KptFunc](../interfaces/_src_types_.kptfunc.md)): *[TestRunner](_src_testing_.testrunner.md)*

**Parameters:**

Name | Type |
------ | ------ |
`fn` | [KptFunc](../interfaces/_src_types_.kptfunc.md) |

**Returns:** *[TestRunner](_src_testing_.testrunner.md)*

## Methods

###  run

▸ **run**(`input`: [Configs](_src_types_.configs.md), `expectedOutput?`: [Configs](_src_types_.configs.md) | [ConfigError](_src_errors_.configerror.md), `expectException?`: undefined | false | true): *function*

Generates a callback for a test framework to execute.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`input` | [Configs](_src_types_.configs.md) | new Configs() | is the initial set of Configs to test.   By default assumes an empty set of Configs. |
`expectedOutput?` | [Configs](_src_types_.configs.md) &#124; [ConfigError](_src_errors_.configerror.md) | - | is the expected resulting Configs or ConfigError produced by the KptFunc.   If undefined, assumes the output should remain unchanged. |
`expectException?` | undefined &#124; false &#124; true | - | indicates that KptFunc is expected to throw an exception.  |

**Returns:** *function*

▸ (): *void*
