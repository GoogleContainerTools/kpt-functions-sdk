
/**
 * CODE GENERATED BY 'typgen' BINARY.
 *
 * DO NOT EDIT.
 */

import { KubernetesObject } from 'kpt-functions';
import * as apiCoreV1 from './io.k8s.api.core.v1';
import * as pkgApiResource from './io.k8s.apimachinery.pkg.api.resource';
import * as apisMetaV1 from './io.k8s.apimachinery.pkg.apis.meta.v1';

// CSIStorageCapacity stores the result of one CSI GetCapacity call. For a given StorageClass, this describes the available capacity in a particular topology segment.  This can be used when considering where to instantiate new PersistentVolumes.
// 
// For example this can express things like: - StorageClass "standard" has "1234 GiB" available in "topology.kubernetes.io/zone=us-east1" - StorageClass "localssd" has "10 GiB" available in "kubernetes.io/hostname=knode-abc123"
// 
// The following three cases all imply that no capacity is available for a certain combination: - no object exists with suitable topology and storage class name - such an object exists, but the capacity is unset - such an object exists, but the capacity is zero
// 
// The producer of these objects can decide which approach is more suitable.
// 
// They are consumed by the kube-scheduler if the CSIStorageCapacity beta feature gate is enabled there and a CSI driver opts into capacity-aware scheduling with CSIDriver.StorageCapacity.
export class CSIStorageCapacity implements KubernetesObject {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Capacity is the value reported by the CSI driver in its GetCapacityResponse for a GetCapacityRequest with topology and parameters that match the previous fields.
  // 
  // The semantic is currently (CSI spec 1.2) defined as: The available capacity, in bytes, of the storage that can be used to provision volumes. If not set, that information is currently unavailable and treated like zero capacity.
  public capacity?: pkgApiResource.Quantity;

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // MaximumVolumeSize is the value reported by the CSI driver in its GetCapacityResponse for a GetCapacityRequest with topology and parameters that match the previous fields.
  // 
  // This is defined since CSI spec 1.4.0 as the largest size that may be used in a CreateVolumeRequest.capacity_range.required_bytes field to create a volume with the same parameters as those in GetCapacityRequest. The corresponding value in the Kubernetes API is ResourceRequirements.Requests in a volume claim.
  public maximumVolumeSize?: pkgApiResource.Quantity;

  // Standard object's metadata. The name has no particular meaning. It must be be a DNS subdomain (dots allowed, 253 characters). To ensure that there are no conflicts with other CSI drivers on the cluster, the recommendation is to use csisc-<uuid>, a generated name, or a reverse-domain name which ends with the unique CSI driver name.
  // 
  // Objects are namespaced.
  // 
  // More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata: apisMetaV1.ObjectMeta;

  // NodeTopology defines which nodes have access to the storage for which capacity was reported. If not set, the storage is not accessible from any node in the cluster. If empty, the storage is accessible from all nodes. This field is immutable.
  public nodeTopology?: apisMetaV1.LabelSelector;

  // The name of the StorageClass that the reported capacity applies to. It must meet the same requirements as the name of a StorageClass object (non-empty, DNS subdomain). If that object no longer exists, the CSIStorageCapacity object is obsolete and should be removed by its creator. This field is immutable.
  public storageClassName: string;

  constructor(desc: CSIStorageCapacity.Interface) {
    this.apiVersion = CSIStorageCapacity.apiVersion;
    this.capacity = desc.capacity;
    this.kind = CSIStorageCapacity.kind;
    this.maximumVolumeSize = desc.maximumVolumeSize;
    this.metadata = desc.metadata;
    this.nodeTopology = desc.nodeTopology;
    this.storageClassName = desc.storageClassName;
  }
}

export function isCSIStorageCapacity(o: any): o is CSIStorageCapacity {
  return o && o.apiVersion === CSIStorageCapacity.apiVersion && o.kind === CSIStorageCapacity.kind;
}

export namespace CSIStorageCapacity {
  export const apiVersion = "storage.k8s.io/v1alpha1";
  export const group = "storage.k8s.io";
  export const version = "v1alpha1";
  export const kind = "CSIStorageCapacity";

  // CSIStorageCapacity stores the result of one CSI GetCapacity call. For a given StorageClass, this describes the available capacity in a particular topology segment.  This can be used when considering where to instantiate new PersistentVolumes.
  // 
  // For example this can express things like: - StorageClass "standard" has "1234 GiB" available in "topology.kubernetes.io/zone=us-east1" - StorageClass "localssd" has "10 GiB" available in "kubernetes.io/hostname=knode-abc123"
  // 
  // The following three cases all imply that no capacity is available for a certain combination: - no object exists with suitable topology and storage class name - such an object exists, but the capacity is unset - such an object exists, but the capacity is zero
  // 
  // The producer of these objects can decide which approach is more suitable.
  // 
  // They are consumed by the kube-scheduler if the CSIStorageCapacity beta feature gate is enabled there and a CSI driver opts into capacity-aware scheduling with CSIDriver.StorageCapacity.
  export interface Interface {
    // Capacity is the value reported by the CSI driver in its GetCapacityResponse for a GetCapacityRequest with topology and parameters that match the previous fields.
    // 
    // The semantic is currently (CSI spec 1.2) defined as: The available capacity, in bytes, of the storage that can be used to provision volumes. If not set, that information is currently unavailable and treated like zero capacity.
    capacity?: pkgApiResource.Quantity;

    // MaximumVolumeSize is the value reported by the CSI driver in its GetCapacityResponse for a GetCapacityRequest with topology and parameters that match the previous fields.
    // 
    // This is defined since CSI spec 1.4.0 as the largest size that may be used in a CreateVolumeRequest.capacity_range.required_bytes field to create a volume with the same parameters as those in GetCapacityRequest. The corresponding value in the Kubernetes API is ResourceRequirements.Requests in a volume claim.
    maximumVolumeSize?: pkgApiResource.Quantity;

    // Standard object's metadata. The name has no particular meaning. It must be be a DNS subdomain (dots allowed, 253 characters). To ensure that there are no conflicts with other CSI drivers on the cluster, the recommendation is to use csisc-<uuid>, a generated name, or a reverse-domain name which ends with the unique CSI driver name.
    // 
    // Objects are namespaced.
    // 
    // More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata: apisMetaV1.ObjectMeta;

    // NodeTopology defines which nodes have access to the storage for which capacity was reported. If not set, the storage is not accessible from any node in the cluster. If empty, the storage is accessible from all nodes. This field is immutable.
    nodeTopology?: apisMetaV1.LabelSelector;

    // The name of the StorageClass that the reported capacity applies to. It must meet the same requirements as the name of a StorageClass object (non-empty, DNS subdomain). If that object no longer exists, the CSIStorageCapacity object is obsolete and should be removed by its creator. This field is immutable.
    storageClassName: string;
  }
}

// CSIStorageCapacityList is a collection of CSIStorageCapacity objects.
export class CSIStorageCapacityList {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Items is the list of CSIStorageCapacity objects.
  public items: CSIStorageCapacity[];

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard list metadata More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata?: apisMetaV1.ListMeta;

  constructor(desc: CSIStorageCapacityList) {
    this.apiVersion = CSIStorageCapacityList.apiVersion;
    this.items = desc.items.map((i) => new CSIStorageCapacity(i));
    this.kind = CSIStorageCapacityList.kind;
    this.metadata = desc.metadata;
  }
}

export function isCSIStorageCapacityList(o: any): o is CSIStorageCapacityList {
  return o && o.apiVersion === CSIStorageCapacityList.apiVersion && o.kind === CSIStorageCapacityList.kind;
}

export namespace CSIStorageCapacityList {
  export const apiVersion = "storage.k8s.io/v1alpha1";
  export const group = "storage.k8s.io";
  export const version = "v1alpha1";
  export const kind = "CSIStorageCapacityList";

  // CSIStorageCapacityList is a collection of CSIStorageCapacity objects.
  export interface Interface {
    // Items is the list of CSIStorageCapacity objects.
    items: CSIStorageCapacity[];

    // Standard list metadata More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata?: apisMetaV1.ListMeta;
  }
}

// VolumeAttachment captures the intent to attach or detach the specified volume to/from the specified node.
// 
// VolumeAttachment objects are non-namespaced.
export class VolumeAttachment implements KubernetesObject {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard object metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata: apisMetaV1.ObjectMeta;

  // Specification of the desired attach/detach volume behavior. Populated by the Kubernetes system.
  public spec: VolumeAttachmentSpec;

  // Status of the VolumeAttachment request. Populated by the entity completing the attach or detach operation, i.e. the external-attacher.
  public status?: VolumeAttachmentStatus;

  constructor(desc: VolumeAttachment.Interface) {
    this.apiVersion = VolumeAttachment.apiVersion;
    this.kind = VolumeAttachment.kind;
    this.metadata = desc.metadata;
    this.spec = desc.spec;
    this.status = desc.status;
  }
}

export function isVolumeAttachment(o: any): o is VolumeAttachment {
  return o && o.apiVersion === VolumeAttachment.apiVersion && o.kind === VolumeAttachment.kind;
}

export namespace VolumeAttachment {
  export const apiVersion = "storage.k8s.io/v1alpha1";
  export const group = "storage.k8s.io";
  export const version = "v1alpha1";
  export const kind = "VolumeAttachment";

  // VolumeAttachment captures the intent to attach or detach the specified volume to/from the specified node.
  // 
  // VolumeAttachment objects are non-namespaced.
  export interface Interface {
    // Standard object metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata: apisMetaV1.ObjectMeta;

    // Specification of the desired attach/detach volume behavior. Populated by the Kubernetes system.
    spec: VolumeAttachmentSpec;

    // Status of the VolumeAttachment request. Populated by the entity completing the attach or detach operation, i.e. the external-attacher.
    status?: VolumeAttachmentStatus;
  }
}

// VolumeAttachmentList is a collection of VolumeAttachment objects.
export class VolumeAttachmentList {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Items is the list of VolumeAttachments
  public items: VolumeAttachment[];

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard list metadata More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata?: apisMetaV1.ListMeta;

  constructor(desc: VolumeAttachmentList) {
    this.apiVersion = VolumeAttachmentList.apiVersion;
    this.items = desc.items.map((i) => new VolumeAttachment(i));
    this.kind = VolumeAttachmentList.kind;
    this.metadata = desc.metadata;
  }
}

export function isVolumeAttachmentList(o: any): o is VolumeAttachmentList {
  return o && o.apiVersion === VolumeAttachmentList.apiVersion && o.kind === VolumeAttachmentList.kind;
}

export namespace VolumeAttachmentList {
  export const apiVersion = "storage.k8s.io/v1alpha1";
  export const group = "storage.k8s.io";
  export const version = "v1alpha1";
  export const kind = "VolumeAttachmentList";

  // VolumeAttachmentList is a collection of VolumeAttachment objects.
  export interface Interface {
    // Items is the list of VolumeAttachments
    items: VolumeAttachment[];

    // Standard list metadata More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata?: apisMetaV1.ListMeta;
  }
}

// VolumeAttachmentSource represents a volume that should be attached. Right now only PersistenVolumes can be attached via external attacher, in future we may allow also inline volumes in pods. Exactly one member can be set.
export class VolumeAttachmentSource {
  // inlineVolumeSpec contains all the information necessary to attach a persistent volume defined by a pod's inline VolumeSource. This field is populated only for the CSIMigration feature. It contains translated fields from a pod's inline VolumeSource to a PersistentVolumeSpec. This field is alpha-level and is only honored by servers that enabled the CSIMigration feature.
  public inlineVolumeSpec?: apiCoreV1.PersistentVolumeSpec;

  // Name of the persistent volume to attach.
  public persistentVolumeName?: string;
}

// VolumeAttachmentSpec is the specification of a VolumeAttachment request.
export class VolumeAttachmentSpec {
  // Attacher indicates the name of the volume driver that MUST handle this request. This is the name returned by GetPluginName().
  public attacher: string;

  // The node that the volume should be attached to.
  public nodeName: string;

  // Source represents the volume that should be attached.
  public source: VolumeAttachmentSource;

  constructor(desc: VolumeAttachmentSpec) {
    this.attacher = desc.attacher;
    this.nodeName = desc.nodeName;
    this.source = desc.source;
  }
}

// VolumeAttachmentStatus is the status of a VolumeAttachment request.
export class VolumeAttachmentStatus {
  // The last error encountered during attach operation, if any. This field must only be set by the entity completing the attach operation, i.e. the external-attacher.
  public attachError?: VolumeError;

  // Indicates the volume is successfully attached. This field must only be set by the entity completing the attach operation, i.e. the external-attacher.
  public attached: boolean;

  // Upon successful attach, this field is populated with any information returned by the attach operation that must be passed into subsequent WaitForAttach or Mount calls. This field must only be set by the entity completing the attach operation, i.e. the external-attacher.
  public attachmentMetadata?: {[key: string]: string};

  // The last error encountered during detach operation, if any. This field must only be set by the entity completing the detach operation, i.e. the external-attacher.
  public detachError?: VolumeError;

  constructor(desc: VolumeAttachmentStatus) {
    this.attachError = desc.attachError;
    this.attached = desc.attached;
    this.attachmentMetadata = desc.attachmentMetadata;
    this.detachError = desc.detachError;
  }
}

// VolumeError captures an error encountered during a volume operation.
export class VolumeError {
  // String detailing the error encountered during Attach or Detach operation. This string maybe logged, so it should not contain sensitive information.
  public message?: string;

  // Time the error was encountered.
  public time?: apisMetaV1.Time;
}