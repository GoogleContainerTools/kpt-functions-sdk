[@googlecontainertools/kpt-functions](../README.md) › ["src/errors"](../modules/_src_errors_.md) › [ConfigError](_src_errors_.configerror.md)

# Class: ConfigError

Base class that represent a configuration-related error.

Typically you should use one of the more specific child classes.

## Hierarchy

* [Error](_src_errors_.configerror.md#static-error)

  ↳ **ConfigError**

  ↳ [MultiConfigError](_src_errors_.multiconfigerror.md)

  ↳ [ConfigFileError](_src_errors_.configfileerror.md)

  ↳ [KubernetesObjectError](_src_errors_.kubernetesobjecterror.md)

## Index

### Constructors

* [constructor](_src_errors_.configerror.md#constructor)

### Properties

* [message](_src_errors_.configerror.md#message)
* [name](_src_errors_.configerror.md#name)
* [stack](_src_errors_.configerror.md#optional-stack)
* [Error](_src_errors_.configerror.md#static-error)

## Constructors

###  constructor

\+ **new ConfigError**(`message`: string): *[ConfigError](_src_errors_.configerror.md)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |

**Returns:** *[ConfigError](_src_errors_.configerror.md)*

## Properties

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

*Overrides [ConfigError](_src_errors_.configerror.md).[stack](_src_errors_.configerror.md#optional-stack)*

___

### `Static` Error

▪ **Error**: *ErrorConstructor*
