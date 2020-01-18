[@googlecontainertools/kpt-functions](../README.md) › ["errors"](../modules/_errors_.md) › [ConfigError](_errors_.configerror.md)

# Class: ConfigError

Base class that represent a configuration-related error.

Typically you should use one of the more specific child classes.

## Hierarchy

* [Error](_errors_.configerror.md#static-error)

  ↳ **ConfigError**

  ↳ [MultiConfigError](_errors_.multiconfigerror.md)

  ↳ [ConfigFileError](_errors_.configfileerror.md)

  ↳ [KubernetesObjectError](_errors_.kubernetesobjecterror.md)

## Index

### Constructors

* [constructor](_errors_.configerror.md#constructor)

### Properties

* [message](_errors_.configerror.md#message)
* [name](_errors_.configerror.md#name)
* [stack](_errors_.configerror.md#optional-stack)
* [Error](_errors_.configerror.md#static-error)

## Constructors

###  constructor

\+ **new ConfigError**(`message`: string): *[ConfigError](_errors_.configerror.md)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |

**Returns:** *[ConfigError](_errors_.configerror.md)*

## Properties

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

*Overrides [ConfigError](_errors_.configerror.md).[stack](_errors_.configerror.md#optional-stack)*

___

### `Static` Error

▪ **Error**: *ErrorConstructor*
