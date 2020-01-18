[@googlecontainertools/kpt-functions](../README.md) › ["src/errors"](../modules/_src_errors_.md) › [ConfigFileError](_src_errors_.configfileerror.md)

# Class: ConfigFileError

Represents an error with a configuration file.

## Hierarchy

  ↳ [ConfigError](_src_errors_.configerror.md)

  ↳ **ConfigFileError**

## Index

### Constructors

* [constructor](_src_errors_.configfileerror.md#constructor)

### Properties

* [message](_src_errors_.configfileerror.md#message)
* [name](_src_errors_.configfileerror.md#name)
* [path](_src_errors_.configfileerror.md#path)
* [stack](_src_errors_.configfileerror.md#optional-stack)

### Methods

* [toString](_src_errors_.configfileerror.md#tostring)

## Constructors

###  constructor

\+ **new ConfigFileError**(`message`: string, `path`: string): *[ConfigFileError](_src_errors_.configfileerror.md)*

*Overrides [ConfigError](_src_errors_.configerror.md).[constructor](_src_errors_.configerror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`path` | string |

**Returns:** *[ConfigFileError](_src_errors_.configfileerror.md)*

## Properties

###  message

• **message**: *string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[message](_src_errors_.configerror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[name](_src_errors_.configerror.md#name)*

___

###  path

• **path**: *string*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[stack](_src_errors_.configerror.md#optional-stack)*

## Methods

###  toString

▸ **toString**(): *string*

**Returns:** *string*
