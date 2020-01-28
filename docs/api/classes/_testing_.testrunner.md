[@googlecontainertools/kpt-functions](../README.md) › ["testing"](../modules/_testing_.md) › [TestRunner](_testing_.testrunner.md)

# Class: TestRunner

TestRunner makes it easy to write unit tests for KPT functions.

## Hierarchy

* **TestRunner**

## Index

### Constructors

* [constructor](_testing_.testrunner.md#constructor)

### Methods

* [assert](_testing_.testrunner.md#assert)
* [assertCallback](_testing_.testrunner.md#assertcallback)

## Constructors

###  constructor

\+ **new TestRunner**(`fn`: [KptFunc](../interfaces/_types_.kptfunc.md)): *[TestRunner](_testing_.testrunner.md)*

**Parameters:**

Name | Type |
------ | ------ |
`fn` | [KptFunc](../interfaces/_types_.kptfunc.md) |

**Returns:** *[TestRunner](_testing_.testrunner.md)*

## Methods

###  assert

▸ **assert**(`input`: [Configs](_types_.configs.md), `expectedOutput?`: [Configs](_types_.configs.md), `expectedException?`: undefined | object, `expectedExceptionMessage?`: string | RegExp): *Promise‹void›*

Runs the KptFunc and asserts the expected output or exception.

Example usage:

```
const RUNNER = new TestRunner(myFunc);

it('function is a NO OP', async () => {
  await RUNNER.assert());
};
```

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`input` | [Configs](_types_.configs.md) | new Configs() | input Configs passed to the function. It is deep-copied before running the function.   If undefined, assumes an empty Configs. |
`expectedOutput?` | [Configs](_types_.configs.md) | - | expected resultant Configs after KptFunc has successfully completed.   If undefined, assumes the output should remain unchanged (NO OP). |
`expectedException?` | undefined &#124; object | - | expected exception to be thrown. If given, expectedOutput is ignored. |
`expectedExceptionMessage?` | string &#124; RegExp | - | expected message of expection to be thrown. If given, expectedOutput is ignored.  |

**Returns:** *Promise‹void›*

___

###  assertCallback

▸ **assertCallback**(`input`: [Configs](_types_.configs.md), `expectedOutput?`: [Configs](_types_.configs.md), `expectedException?`: undefined | object, `expectedExceptionMessage?`: string | RegExp): *function*

Similar to [assert](_testing_.testrunner.md#assert) method, but instead returns an assertion function that can be passed directly to 'it'.

Example usage:

```
const RUNNER = new TestRunner(myFunc);

it('function is a NO OP', RUNNER.assertCallback());
```

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`input` | [Configs](_types_.configs.md) | new Configs() | input Configs passed to the function. It is deep-copied before running the function.   If undefined, assumes an empty Configs. |
`expectedOutput?` | [Configs](_types_.configs.md) | - | expected resultant Configs after KptFunc has successfully completed.   If undefined, assumes the output should remain unchanged (NO OP). |
`expectedException?` | undefined &#124; object | - | expected exception to be thrown. If given, expectedOutput is ignored. |
`expectedExceptionMessage?` | string &#124; RegExp | - | expected message of expection to be thrown. If given, expectedOutput is ignored.  |

**Returns:** *function*

▸ (): *Promise‹void›*
