[@googlecontainertools/kpt-functions](../README.md) › ["types"](../modules/_types_.md) › [Configs](_types_.configs.md)

# Class: Configs

Configs is an in-memory document store for Kubernetes objects populated from/to configuration files.

It enables performing rich query and mutation operations.

## Hierarchy

* **Configs**

## Index

### Constructors

* [constructor](_types_.configs.md#constructor)

### Methods

* [delete](_types_.configs.md#delete)
* [deleteAll](_types_.configs.md#deleteall)
* [get](_types_.configs.md#get)
* [getAll](_types_.configs.md#getall)
* [getFunctionConfig](_types_.configs.md#getfunctionconfig)
* [getFunctionConfigValue](_types_.configs.md#getfunctionconfigvalue)
* [getFunctionConfigValueOrThrow](_types_.configs.md#getfunctionconfigvalueorthrow)
* [groupBy](_types_.configs.md#groupby)
* [insert](_types_.configs.md#insert)

## Constructors

###  constructor

\+ **new Configs**(`input`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[], `functionConfig?`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)): *[Configs](_types_.configs.md)*

Creates a Config.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`input` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[] | [] | Input Kubernetes objects. If supplied multiple objects with the same (Group, Kind, Namespace, Name) discards all but the last one. Does not preserve insertion order of the passed objects. |
`functionConfig?` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md) | - | Kubernetes object used to parameterize the function's behavior.  |

**Returns:** *[Configs](_types_.configs.md)*

## Methods

###  delete

▸ **delete**(...`objects`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[]): *void*

Deletes all objects with the same (Group, Kind, Namespace, Name) as any of the passed objects.

Does not throw if passed duplicates or keys which are not present in the Configs.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...objects` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[] | The objects to delete.  |

**Returns:** *void*

___

###  deleteAll

▸ **deleteAll**(): *void*

Deletes all objects.

**Returns:** *void*

___

###  get

▸ **get**<**Kind**>(`isKind`: function): *Kind[]*

Returns an array of objects matching the passed Kind type predicate.

Casts to an array of Kind. May throw if isKind is incorrect.

The ordering of objects is deterministic.

Returned objects are pass-by-reference; mutating them results in changes being persisted.

**Type parameters:**

▪ **Kind**: *[KubernetesObject](../interfaces/_types_.kubernetesobject.md)*

**Parameters:**

▪ **isKind**: *function*

is a type predicate on the desired type.

▸ (`o`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)): *o is Kind*

**Parameters:**

Name | Type |
------ | ------ |
`o` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md) |

**Returns:** *Kind[]*

___

###  getAll

▸ **getAll**(): *[KubernetesObject](../interfaces/_types_.kubernetesobject.md)[]*

Returns an array of all the objects in this Configs.

The ordering of objects is deterministic.

Returned objects are pass-by-reference; mutating them results in changes being persisted.

**Returns:** *[KubernetesObject](../interfaces/_types_.kubernetesobject.md)[]*

___

###  getFunctionConfig

▸ **getFunctionConfig**(): *[KubernetesObject](../interfaces/_types_.kubernetesobject.md) | undefined*

Returns the functionConfig if defined.

**Returns:** *[KubernetesObject](../interfaces/_types_.kubernetesobject.md) | undefined*

___

###  getFunctionConfigValue

▸ **getFunctionConfigValue**(`key`: string): *string | undefined*

Returns the value for the given key if functionConfig is of kind ConfigMap.

Throws an exception if functionConfig kind is not a ConfigMap.

Returns undefined if functionConfig is undefined OR
if the ConfigMap has no such key in the 'data' section.

**`key`** key The key in the 'data' field in the ConfigMap object passed as the functionConfig.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *string | undefined*

___

###  getFunctionConfigValueOrThrow

▸ **getFunctionConfigValueOrThrow**(`key`: string): *string*

Similar to [getFunctionConfigValue](_types_.configs.md#getfunctionconfigvalue) except it throws an exception if the given key is undefined.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *string*

___

###  groupBy

▸ **groupBy**(`keyFn`: function): *Array‹[string, [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[]]›*

Partitions the objects using the provided key function

The ordering of objects with the same key is deterministic.

Example: Partition configs by Namespace:

const configsByNamespace = configs.groupBy((o) => o.metadata.namespace)

**Parameters:**

▪ **keyFn**: *function*

Generates a key for each Value.

▸ (`object`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)): *string*

**Parameters:**

Name | Type |
------ | ------ |
`object` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md) |

**Returns:** *Array‹[string, [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[]]›*

___

###  insert

▸ **insert**(...`objects`: [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[]): *void*

Inserts objects into the Configs.

If another object already in Configs has the same (Group, Kind, Namespace, Name), replaces that one with the
passed object.

If multiple objects have the same (Group, Kind, Namespace, Name), discards all but the last one.

Does not preserve insertion order of the passed objects.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`...objects` | [KubernetesObject](../interfaces/_types_.kubernetesobject.md)[] | The objects to insert.  |

**Returns:** *void*
