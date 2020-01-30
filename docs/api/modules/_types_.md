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
* [kubernetesKey](_types_.md#kuberneteskey)

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

###  kubernetesKey

▸ **kubernetesKey**(`o`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)): *string*

A unique key for a Kubernetes object defined as tuple of (apiVersion, kind, namespace, name).

**Parameters:**

Name | Type |
------ | ------ |
`o` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md) |

**Returns:** *string*
