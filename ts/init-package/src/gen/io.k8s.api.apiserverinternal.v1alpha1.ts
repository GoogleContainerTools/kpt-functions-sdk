
/**
 * CODE GENERATED BY 'typgen' BINARY.
 *
 * DO NOT EDIT.
 */

import { KubernetesObject } from 'kpt-functions';
import * as apisMetaV1 from './io.k8s.apimachinery.pkg.apis.meta.v1';

// An API server instance reports the version it can decode and the version it encodes objects to when persisting objects in the backend.
export class ServerStorageVersion {
  // The ID of the reporting API server.
  public apiServerID?: string;

  // The API server can decode objects encoded in these versions. The encodingVersion must be included in the decodableVersions.
  public decodableVersions?: string[];

  // The API server encodes the object to this version when persisting it in the backend (e.g., etcd).
  public encodingVersion?: string;
}

// 
//  Storage version of a specific resource.
export class StorageVersion implements KubernetesObject {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // The name is <group>.<resource>.
  public metadata: apisMetaV1.ObjectMeta;

  // Spec is an empty spec. It is here to comply with Kubernetes API style.
  public spec: StorageVersionSpec;

  // API server instances report the version they can decode and the version they encode objects to when persisting objects in the backend.
  public status: StorageVersionStatus;

  constructor(desc: StorageVersion.Interface) {
    this.apiVersion = StorageVersion.apiVersion;
    this.kind = StorageVersion.kind;
    this.metadata = desc.metadata;
    this.spec = desc.spec;
    this.status = desc.status;
  }
}

export function isStorageVersion(o: any): o is StorageVersion {
  return o && o.apiVersion === StorageVersion.apiVersion && o.kind === StorageVersion.kind;
}

export namespace StorageVersion {
  export const apiVersion = "internal.apiserver.k8s.io/v1alpha1";
  export const group = "internal.apiserver.k8s.io";
  export const version = "v1alpha1";
  export const kind = "StorageVersion";

  // 
  //  Storage version of a specific resource.
  export interface Interface {
    // The name is <group>.<resource>.
    metadata: apisMetaV1.ObjectMeta;

    // Spec is an empty spec. It is here to comply with Kubernetes API style.
    spec: StorageVersionSpec;

    // API server instances report the version they can decode and the version they encode objects to when persisting objects in the backend.
    status: StorageVersionStatus;
  }
}

// Describes the state of the storageVersion at a certain point.
export class StorageVersionCondition {
  // Last time the condition transitioned from one status to another.
  public lastTransitionTime?: apisMetaV1.Time;

  // A human readable message indicating details about the transition.
  public message?: string;

  // If set, this represents the .metadata.generation that the condition was set based upon.
  public observedGeneration?: number;

  // The reason for the condition's last transition.
  public reason: string;

  // Status of the condition, one of True, False, Unknown.
  public status: string;

  // Type of the condition.
  public type: string;

  constructor(desc: StorageVersionCondition) {
    this.lastTransitionTime = desc.lastTransitionTime;
    this.message = desc.message;
    this.observedGeneration = desc.observedGeneration;
    this.reason = desc.reason;
    this.status = desc.status;
    this.type = desc.type;
  }
}

// A list of StorageVersions.
export class StorageVersionList {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  public items: StorageVersion[];

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  public metadata?: apisMetaV1.ListMeta;

  constructor(desc: StorageVersionList) {
    this.apiVersion = StorageVersionList.apiVersion;
    this.items = desc.items.map((i) => new StorageVersion(i));
    this.kind = StorageVersionList.kind;
    this.metadata = desc.metadata;
  }
}

export function isStorageVersionList(o: any): o is StorageVersionList {
  return o && o.apiVersion === StorageVersionList.apiVersion && o.kind === StorageVersionList.kind;
}

export namespace StorageVersionList {
  export const apiVersion = "internal.apiserver.k8s.io/v1alpha1";
  export const group = "internal.apiserver.k8s.io";
  export const version = "v1alpha1";
  export const kind = "StorageVersionList";

  // A list of StorageVersions.
  export interface Interface {
    items: StorageVersion[];

    metadata?: apisMetaV1.ListMeta;
  }
}

// StorageVersionSpec is an empty spec.
export type StorageVersionSpec = object;

// API server instances report the versions they can decode and the version they encode objects to when persisting objects in the backend.
export class StorageVersionStatus {
  // If all API server instances agree on the same encoding storage version, then this field is set to that version. Otherwise this field is left empty. API servers should finish updating its storageVersionStatus entry before serving write operations, so that this field will be in sync with the reality.
  public commonEncodingVersion?: string;

  // The latest available observations of the storageVersion's state.
  public conditions?: StorageVersionCondition[];

  // The reported versions per API server instance.
  public storageVersions?: ServerStorageVersion[];
}