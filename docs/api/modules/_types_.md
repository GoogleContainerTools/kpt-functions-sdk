[@googlecontainertools/kpt-functions](../README.md) › ["types"](_types_.md)

# External module: "types"

## Index

### Classes

* [Configs](../classes/_types_.configs.md)

### Interfaces

* [KptFunc](../interfaces/_types_.kptfunc.md)
* [KubernetesObject](../interfaces/_types_.kubernetesobject.md)

### Functions

* [isKubernetesObject](_types_.md#iskubernetesobject)
* [kubernetesKeyFn](_types_.md#kuberneteskeyfn)

## Functions

###  isKubernetesObject

▸ **isKubernetesObject**(`o`: any): *o is KubernetesObject*

Type guard for KubernetesObject.

**Parameters:**

Name | Type |
------ | ------ |
`o` | any |

**Returns:** *o is KubernetesObject*

___

###  kubernetesKeyFn

▸ **kubernetesKeyFn**(`o`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)): *string*

Generates the primary key for a Kubernetes objects in Configs.

**Parameters:**

Name | Type |
------ | ------ |
`o` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md) |

**Returns:** *string*
