[@googlecontainertools/kpt-functions](../README.md) › ["src/metadata"](_src_metadata_.md)

# External module: "src/metadata"

## Index

### Variables

* [ANNOTATION_PREFIX](_src_metadata_.md#const-annotation_prefix)
* [SOURCE_INDEX_ANNOTATION](_src_metadata_.md#const-source_index_annotation)
* [SOURCE_PATH_ANNOTATION](_src_metadata_.md#const-source_path_annotation)

### Functions

* [addAnnotation](_src_metadata_.md#addannotation)
* [addLabel](_src_metadata_.md#addlabel)
* [getAnnotation](_src_metadata_.md#getannotation)
* [getLabel](_src_metadata_.md#getlabel)
* [removeAnnotation](_src_metadata_.md#removeannotation)
* [removeLabel](_src_metadata_.md#removelabel)

## Variables

### `Const` ANNOTATION_PREFIX

• **ANNOTATION_PREFIX**: *"config.kubernetes.io"* = "config.kubernetes.io"

___

### `Const` SOURCE_INDEX_ANNOTATION

• **SOURCE_INDEX_ANNOTATION**: *string* = `${ANNOTATION_PREFIX}/index`

___

### `Const` SOURCE_PATH_ANNOTATION

• **SOURCE_PATH_ANNOTATION**: *string* = `${ANNOTATION_PREFIX}/path`

## Functions

###  addAnnotation

▸ **addAnnotation**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md), `annotation`: string, `value`: string): *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

Add an annotation to a KubernetesObject's metadata. Overwrites the previously existing annotation if it exists.
Return the resulting object.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) | The object to add the annotation to. |
`annotation` | string | The annotation to set. |
`value` | string | The value to set the annotation to.  |

**Returns:** *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

___

###  addLabel

▸ **addLabel**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md), `label`: string, `value`: string): *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

Add a label to a KubernetesObject's metadata. Overwrites the previously existing label if it exists.
Return the resulting object.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) | The object to add the label to. |
`label` | string | The label to set. |
`value` | string | The value to set the label to.  |

**Returns:** *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

___

###  getAnnotation

▸ **getAnnotation**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md), `annotation`: string): *string | undefined*

Get the value of the object's annotation, or undefined if it is not set.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) | The object to get the annotation from. |
`annotation` | string | The annotation to get.  |

**Returns:** *string | undefined*

___

###  getLabel

▸ **getLabel**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md), `label`: string): *string | undefined*

Get the value of the object's label, or undefined if it is not set.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) | The object to get the label from. |
`label` | string | The label to get.  |

**Returns:** *string | undefined*

___

###  removeAnnotation

▸ **removeAnnotation**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md), `annotation`: string): *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

Remove an annotation from a KubernetesObject's metadata. If the resulting metadata.annotations is empty, removes
it. Return the resulting object.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) | The object to remove the annotation from. |
`annotation` | string | The annotation to remove.  |

**Returns:** *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

___

###  removeLabel

▸ **removeLabel**(`o`: [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md), `label`: string): *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*

Remove a label from a KubernetesObject's metadata. If the resulting metadata.labels is empty, removes
it. Return the resulting object.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`o` | [KubernetesObject](../interfaces/_src_types_.kubernetesobject.md) | The object to remove the label from. |
`label` | string | The label to remove.  |

**Returns:** *[KubernetesObject](../interfaces/_src_types_.kubernetesobject.md)*
