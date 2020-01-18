[@googlecontainertools/kpt-functions](../README.md) › ["errors"](../modules/_errors_.md) › [ConfigFileError](_errors_.configfileerror.md)

# Class: ConfigFileError

Represents an error with a configuration file.

## Hierarchy

  ↳ [ConfigError](_errors_.configerror.md)

  ↳ **ConfigFileError**

## Index

### Constructors

* [constructor](_errors_.configfileerror.md#constructor)

### Properties

* [message](_errors_.configfileerror.md#message)
* [name](_errors_.configfileerror.md#name)
* [path](_errors_.configfileerror.md#path)
* [stack](_errors_.configfileerror.md#optional-stack)

### Methods

* [toString](_errors_.configfileerror.md#tostring)

## Constructors

###  constructor

\+ **new ConfigFileError**(`message`: string, `path`: string): *[ConfigFileError](_errors_.configfileerror.md)*

*Overrides [ConfigError](_errors_.configerror.md).[constructor](_errors_.configerror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`path` | string |

**Returns:** *[ConfigFileError](_errors_.configfileerror.md)*

## Properties

###  message

• **message**: *string*

*Inherited from [ConfigError](_errors_.configerror.md).[message](_errors_.configerror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [ConfigError](_errors_.configerror.md).[name](_errors_.configerror.md#name)*

___

###  path

• **path**: *string*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [ConfigError](_errors_.configerror.md).[stack](_errors_.configerror.md#optional-stack)*

## Methods

###  toString

▸ **toString**(): *string*

**Returns:** *string*
