[@googlecontainertools/kpt-functions](../README.md) › ["src/errors"](../modules/_src_errors_.md) › [KubernetesObjectError](_src_errors_.kubernetesobjecterror.md)

# Class: KubernetesObjectError

Represents an error with a KubernetesObject.

## Hierarchy

  ↳ [ConfigError](_src_errors_.configerror.md)

  ↳ **KubernetesObjectError**

## Index

### Constructors

* [constructor](_src_errors_.kubernetesobjecterror.md#constructor)

### Properties

* [message](_src_errors_.kubernetesobjecterror.md#message)
* [name](_src_errors_.kubernetesobjecterror.md#name)
* [object](_src_errors_.kubernetesobjecterror.md#object)
* [stack](_src_errors_.kubernetesobjecterror.md#optional-stack)

### Methods

* [toString](_src_errors_.kubernetesobjecterror.md#tostring)

## Constructors

###  constructor

\+ **new KubernetesObjectError**(`message`: string, `object`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)): *[KubernetesObjectError](_src_errors_.kubernetesobjecterror.md)*

*Overrides [ConfigError](_src_errors_.configerror.md).[constructor](_src_errors_.configerror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`object` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) |

**Returns:** *[KubernetesObjectError](_src_errors_.kubernetesobjecterror.md)*

## Properties

###  message

• **message**: *string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[message](_src_errors_.configerror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[name](_src_errors_.configerror.md#name)*

___

###  object

• **object**: *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [ConfigError](_src_errors_.configerror.md).[stack](_src_errors_.configerror.md#optional-stack)*

## Methods

###  toString

▸ **toString**(): *string*

**Returns:** *string*
