[@googlecontainertools/kpt-functions](../README.md) › ["errors"](../modules/_errors_.md) › [KubernetesObjectError](_errors_.kubernetesobjecterror.md)

# Class: KubernetesObjectError

Represents an error with a KubernetesObject.

## Hierarchy

  ↳ [ConfigError](_errors_.configerror.md)

  ↳ **KubernetesObjectError**

## Index

### Constructors

* [constructor](_errors_.kubernetesobjecterror.md#constructor)

### Properties

* [message](_errors_.kubernetesobjecterror.md#message)
* [name](_errors_.kubernetesobjecterror.md#name)
* [object](_errors_.kubernetesobjecterror.md#object)
* [stack](_errors_.kubernetesobjecterror.md#optional-stack)

### Methods

* [toString](_errors_.kubernetesobjecterror.md#tostring)

## Constructors

###  constructor

\+ **new KubernetesObjectError**(`message`: string, `object`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)): *[KubernetesObjectError](_errors_.kubernetesobjecterror.md)*

*Overrides [ConfigError](_errors_.configerror.md).[constructor](_errors_.configerror.md#constructor)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |
`object` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md) |

**Returns:** *[KubernetesObjectError](_errors_.kubernetesobjecterror.md)*

## Properties

###  message

• **message**: *string*

*Inherited from [ConfigError](_errors_.configerror.md).[message](_errors_.configerror.md#message)*

___

###  name

• **name**: *string*

*Inherited from [ConfigError](_errors_.configerror.md).[name](_errors_.configerror.md#name)*

___

###  object

• **object**: *[KubernetesObject](../interfaces/_types_.kubernetesobject.md)*

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from [ConfigError](_errors_.configerror.md).[stack](_errors_.configerror.md#optional-stack)*

## Methods

###  toString

▸ **toString**(): *string*

**Returns:** *string*
