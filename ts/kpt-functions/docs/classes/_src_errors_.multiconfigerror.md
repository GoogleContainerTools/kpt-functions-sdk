[@googlecontainertools/kpt-functions](../README.md) › ["src/errors"](../modules/_src_errors_.md) › [MultiConfigError](_src_errors_.multiconfigerror.md)

# Class: MultiConfigError

Wraps multiple ConfigError objects.

## Hierarchy

  ↳ [ConfigError](_src_errors_.configerror.md)

  ↳ **MultiConfigError**

## Index

### Constructors

* [constructor](_src_errors_.multiconfigerror.md#constructor)

### Properties

* [errors](_src_errors_.multiconfigerror.md#errors)
* [message](_src_errors_.multiconfigerror.md#message)
* [name](_src_errors_.multiconfigerror.md#name)
* [stack](_src_errors_.multiconfigerror.md#optional-stack)

### Methods

* [push](_src_errors_.multiconfigerror.md#push)
* [toString](_src_errors_.multiconfigerror.md#tostring)

## Constructors

###  constructor

\+ **new MultiConfigError**(`message`: string, `errors`: [ConfigError](_src_errors_.configerror.md)[]): *[MultiConfigError](_src_errors_.multiconfigerror.md)*

*Overrides [ConfigError](_src_errors_.configerror.md).[constructor](_src_errors_.configerror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`errors` | [ConfigError](_src_errors_.configerror.md)[] |

**Returns:** *[MultiConfigError](_src_errors_.multiconfigerror.md)*

## Properties

###  errors

• **errors**: *[ConfigError](_src_errors_.configerror.md)[]*

___

###  message

• **message**: *string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[message](_src_errors_.configerror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[name](_src_errors_.configerror.md#name)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[stack](_src_errors_.configerror.md#optional-stack)*

## Methods

###  push

▸ **push**(`error`: [ConfigError](_src_errors_.configerror.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`error` | [ConfigError](_src_errors_.configerror.md) |

**Returns:** *void*

___

###  toString

▸ **toString**(): *string*

**Returns:** *string*
