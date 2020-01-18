[@googlecontainertools/kpt-functions](../README.md) › ["src/types"](_src_types_.md)

# External module: "src/types"

## Index

### Classes

* [Configs](../classes/_src_types_.configs.md)

### Interfaces

* [KptFunc](../interfaces/_src_types_.kptfunc.md)
* [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)

### Functions

* [isKubernetesObject](_src_types_.md#iskubernetesobject)
* [kubernetesKeyFn](_src_types_.md#kuberneteskeyfn)

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

▸ **kubernetesKeyFn**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)): *string*

Generates the primary key for a Kubernetes objects in Configs.

**Parameters:**

Name | Type |
------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) |

**Returns:** *string*
