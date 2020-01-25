[@googlecontainertools/kpt-functions](../README.md) › ["errors"](../modules/_errors_.md) › [MultiConfigError](_errors_.multiconfigerror.md)

# Class: MultiConfigError

Wraps multiple ConfigError objects.

## Hierarchy

  ↳ [ConfigError](_errors_.configerror.md)

  ↳ **MultiConfigError**

## Index

### Constructors

* [constructor](_errors_.multiconfigerror.md#constructor)

### Properties

* [errors](_errors_.multiconfigerror.md#errors)
* [message](_errors_.multiconfigerror.md#message)
* [name](_errors_.multiconfigerror.md#name)
* [stack](_errors_.multiconfigerror.md#optional-stack)

### Methods

* [push](_errors_.multiconfigerror.md#push)
* [toString](_errors_.multiconfigerror.md#tostring)

## Constructors

###  constructor

\+ **new MultiConfigError**(`message`: string, `errors`: [ConfigError](_errors_.configerror.md)[]): *[MultiConfigError](_errors_.multiconfigerror.md)*

*Overrides [ConfigError](_errors_.configerror.md).[constructor](_errors_.configerror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`errors` | [ConfigError](_errors_.configerror.md)[] |

**Returns:** *[MultiConfigError](_errors_.multiconfigerror.md)*

## Properties

###  errors

• **errors**: *[ConfigError](_errors_.configerror.md)[]*

___

###  message

• **message**: *string*

*Inherited from [ConfigError](_errors_.configerror.md).[message](_errors_.configerror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [ConfigError](_errors_.configerror.md).[name](_errors_.configerror.md#name)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [ConfigError](_errors_.configerror.md).[stack](_errors_.configerror.md#optional-stack)*

## Methods

###  push

▸ **push**(`error`: [ConfigError](_errors_.configerror.md)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`error` | [ConfigError](_errors_.configerror.md) |

**Returns:** *void*

___

###  toString

▸ **toString**(): *string*

**Returns:** *string*
