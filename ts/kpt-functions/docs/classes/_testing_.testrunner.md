[@googlecontainertools/kpt-functions](../README.md) › ["testing"](../modules/_testing_.md) › [TestRunner](_testing_.testrunner.md)

# Class: TestRunner

TestRunner makes it easier to write table-driven tests for KPT functions.

## Hierarchy

* **TestRunner**

## Index

### Constructors

* [constructor](_testing_.testrunner.md#constructor)

### Methods

* [run](_testing_.testrunner.md#run)

## Constructors

###  constructor

\+ **new TestRunner**(`fn`: [KptFunc](../interfaces/_types_.kptfunc.md)): *[TestRunner](_testing_.testrunner.md)*

**Parameters:**

Name | Type |
------ | ------ |
`fn` | [KptFunc](../interfaces/_types_.kptfunc.md) |

**Returns:** *[TestRunner](_testing_.testrunner.md)*

## Methods

###  run

▸ **run**(`input`: [Configs](_types_.configs.md), `expectedOutput?`: [Configs](_types_.configs.md) | [ConfigError](_errors_.configerror.md), `expectException?`: undefined | false | true): *function*

Generates a callback for a test framework to execute.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`input` | [Configs](_types_.configs.md) | new Configs() | is the initial set of Configs to test.   By default assumes an empty set of Configs. |
`expectedOutput?` | [Configs](_types_.configs.md) &#124; [ConfigError](_errors_.configerror.md) | - | is the expected resulting Configs or ConfigError produced by the KptFunc.   If undefined, assumes the output should remain unchanged. |
`expectException?` | undefined &#124; false &#124; true | - | indicates that KptFunc is expected to throw an exception.  |

**Returns:** *function*

▸ (): *void*
