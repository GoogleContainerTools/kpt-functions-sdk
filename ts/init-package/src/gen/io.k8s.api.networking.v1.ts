
/**
 * CODE GENERATED BY 'typgen' BINARY.
 *
 * DO NOT EDIT.
 */

import { KubernetesObject } from 'kpt-functions';
import * as apiCoreV1 from './io.k8s.api.core.v1';
import * as apisMetaV1 from './io.k8s.apimachinery.pkg.apis.meta.v1';
import * as pkgUtilIntstr from './io.k8s.apimachinery.pkg.util.intstr';

// HTTPIngressPath associates a path with a backend. Incoming urls matching the path are forwarded to the backend.
export class HTTPIngressPath {
  // Backend defines the referenced service endpoint to which the traffic will be forwarded to.
  public backend: IngressBackend;

  // Path is matched against the path of an incoming request. Currently it can contain characters disallowed from the conventional "path" part of a URL as defined by RFC 3986. Paths must begin with a '/'. When unspecified, all paths from incoming requests are matched.
  public path?: string;

  // PathType determines the interpretation of the Path matching. PathType can be one of the following values: * Exact: Matches the URL path exactly. * Prefix: Matches based on a URL path prefix split by '/'. Matching is
  //   done on a path element by element basis. A path element refers is the
  //   list of labels in the path split by the '/' separator. A request is a
  //   match for path p if every p is an element-wise prefix of p of the
  //   request path. Note that if the last element of the path is a substring
  //   of the last element in request path, it is not a match (e.g. /foo/bar
  //   matches /foo/bar/baz, but does not match /foo/barbaz).
  // * ImplementationSpecific: Interpretation of the Path matching is up to
  //   the IngressClass. Implementations can treat this as a separate PathType
  //   or treat it identically to Prefix or Exact path types.
  // Implementations are required to support all path types.
  public pathType?: string;

  constructor(desc: HTTPIngressPath) {
    this.backend = desc.backend;
    this.path = desc.path;
    this.pathType = desc.pathType;
  }
}

// HTTPIngressRuleValue is a list of http selectors pointing to backends. In the example: http://<host>/<path>?<searchpart> -> backend where where parts of the url correspond to RFC 3986, this resource will be used to match against everything after the last '/' and before the first '?' or '#'.
export class HTTPIngressRuleValue {
  // A collection of paths that map requests to backends.
  public paths: HTTPIngressPath[];

  constructor(desc: HTTPIngressRuleValue) {
    this.paths = desc.paths;
  }
}

// IPBlock describes a particular CIDR (Ex. "192.168.1.1/24","2001:db9::/64") that is allowed to the pods matched by a NetworkPolicySpec's podSelector. The except entry describes CIDRs that should not be included within this rule.
export class IPBlock {
  // CIDR is a string representing the IP Block Valid examples are "192.168.1.1/24" or "2001:db9::/64"
  public cidr: string;

  // Except is a slice of CIDRs that should not be included within an IP Block Valid examples are "192.168.1.1/24" or "2001:db9::/64" Except values will be rejected if they are outside the CIDR range
  public except?: string[];

  constructor(desc: IPBlock) {
    this.cidr = desc.cidr;
    this.except = desc.except;
  }
}

// Ingress is a collection of rules that allow inbound connections to reach the endpoints defined by a backend. An Ingress can be configured to give services externally-reachable urls, load balance traffic, terminate SSL, offer name based virtual hosting etc.
export class Ingress implements KubernetesObject {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata: apisMetaV1.ObjectMeta;

  // Spec is the desired state of the Ingress. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
  public spec?: IngressSpec;

  // Status is the current state of the Ingress. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
  public status?: IngressStatus;

  constructor(desc: Ingress.Interface) {
    this.apiVersion = Ingress.apiVersion;
    this.kind = Ingress.kind;
    this.metadata = desc.metadata;
    this.spec = desc.spec;
    this.status = desc.status;
  }
}

export function isIngress(o: any): o is Ingress {
  return o && o.apiVersion === Ingress.apiVersion && o.kind === Ingress.kind;
}

export namespace Ingress {
  export const apiVersion = "networking.k8s.io/v1";
  export const group = "networking.k8s.io";
  export const version = "v1";
  export const kind = "Ingress";

  // named constructs a Ingress with metadata.name set to name.
  export function named(name: string): Ingress {
    return new Ingress({metadata: {name}});
  }
  // Ingress is a collection of rules that allow inbound connections to reach the endpoints defined by a backend. An Ingress can be configured to give services externally-reachable urls, load balance traffic, terminate SSL, offer name based virtual hosting etc.
  export interface Interface {
    // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata: apisMetaV1.ObjectMeta;

    // Spec is the desired state of the Ingress. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
    spec?: IngressSpec;

    // Status is the current state of the Ingress. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
    status?: IngressStatus;
  }
}

// IngressBackend describes all endpoints for a given service and port.
export class IngressBackend {
  // Resource is an ObjectRef to another Kubernetes resource in the namespace of the Ingress object. If resource is specified, a service.Name and service.Port must not be specified. This is a mutually exclusive setting with "Service".
  public resource?: apiCoreV1.TypedLocalObjectReference;

  // Service references a Service as a Backend. This is a mutually exclusive setting with "Resource".
  public service?: IngressServiceBackend;
}

// IngressClass represents the class of the Ingress, referenced by the Ingress Spec. The `ingressclass.kubernetes.io/is-default-class` annotation can be used to indicate that an IngressClass should be considered default. When a single IngressClass resource has this annotation set to true, new Ingress resources without a class specified will be assigned this default class.
export class IngressClass implements KubernetesObject {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata: apisMetaV1.ObjectMeta;

  // Spec is the desired state of the IngressClass. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
  public spec?: IngressClassSpec;

  constructor(desc: IngressClass.Interface) {
    this.apiVersion = IngressClass.apiVersion;
    this.kind = IngressClass.kind;
    this.metadata = desc.metadata;
    this.spec = desc.spec;
  }
}

export function isIngressClass(o: any): o is IngressClass {
  return o && o.apiVersion === IngressClass.apiVersion && o.kind === IngressClass.kind;
}

export namespace IngressClass {
  export const apiVersion = "networking.k8s.io/v1";
  export const group = "networking.k8s.io";
  export const version = "v1";
  export const kind = "IngressClass";

  // named constructs a IngressClass with metadata.name set to name.
  export function named(name: string): IngressClass {
    return new IngressClass({metadata: {name}});
  }
  // IngressClass represents the class of the Ingress, referenced by the Ingress Spec. The `ingressclass.kubernetes.io/is-default-class` annotation can be used to indicate that an IngressClass should be considered default. When a single IngressClass resource has this annotation set to true, new Ingress resources without a class specified will be assigned this default class.
  export interface Interface {
    // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata: apisMetaV1.ObjectMeta;

    // Spec is the desired state of the IngressClass. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
    spec?: IngressClassSpec;
  }
}

// IngressClassList is a collection of IngressClasses.
export class IngressClassList {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Items is the list of IngressClasses.
  public items: IngressClass[];

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard list metadata.
  public metadata?: apisMetaV1.ListMeta;

  constructor(desc: IngressClassList) {
    this.apiVersion = IngressClassList.apiVersion;
    this.items = desc.items.map((i) => new IngressClass(i));
    this.kind = IngressClassList.kind;
    this.metadata = desc.metadata;
  }
}

export function isIngressClassList(o: any): o is IngressClassList {
  return o && o.apiVersion === IngressClassList.apiVersion && o.kind === IngressClassList.kind;
}

export namespace IngressClassList {
  export const apiVersion = "networking.k8s.io/v1";
  export const group = "networking.k8s.io";
  export const version = "v1";
  export const kind = "IngressClassList";

  // IngressClassList is a collection of IngressClasses.
  export interface Interface {
    // Items is the list of IngressClasses.
    items: IngressClass[];

    // Standard list metadata.
    metadata?: apisMetaV1.ListMeta;
  }
}

// IngressClassParametersReference identifies an API object. This can be used to specify a cluster or namespace-scoped resource.
export class IngressClassParametersReference {
  // APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.
  public apiGroup?: string;

  // Kind is the type of resource being referenced.
  public kind: string;

  // Name is the name of resource being referenced.
  public name: string;

  // Namespace is the namespace of the resource being referenced. This field is required when scope is set to "Namespace" and must be unset when scope is set to "Cluster".
  public namespace?: string;

  // Scope represents if this refers to a cluster or namespace scoped resource. This may be set to "Cluster" (default) or "Namespace". Field can be enabled with IngressClassNamespacedParams feature gate.
  public scope?: string;

  constructor(desc: IngressClassParametersReference) {
    this.apiGroup = desc.apiGroup;
    this.kind = desc.kind;
    this.name = desc.name;
    this.namespace = desc.namespace;
    this.scope = desc.scope;
  }
}

// IngressClassSpec provides information about the class of an Ingress.
export class IngressClassSpec {
  // Controller refers to the name of the controller that should handle this class. This allows for different "flavors" that are controlled by the same controller. For example, you may have different Parameters for the same implementing controller. This should be specified as a domain-prefixed path no more than 250 characters in length, e.g. "acme.io/ingress-controller". This field is immutable.
  public controller?: string;

  // Parameters is a link to a custom resource containing additional configuration for the controller. This is optional if the controller does not require extra parameters.
  public parameters?: IngressClassParametersReference;
}

// IngressList is a collection of Ingress.
export class IngressList {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Items is the list of Ingress.
  public items: Ingress[];

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata?: apisMetaV1.ListMeta;

  constructor(desc: IngressList) {
    this.apiVersion = IngressList.apiVersion;
    this.items = desc.items.map((i) => new Ingress(i));
    this.kind = IngressList.kind;
    this.metadata = desc.metadata;
  }
}

export function isIngressList(o: any): o is IngressList {
  return o && o.apiVersion === IngressList.apiVersion && o.kind === IngressList.kind;
}

export namespace IngressList {
  export const apiVersion = "networking.k8s.io/v1";
  export const group = "networking.k8s.io";
  export const version = "v1";
  export const kind = "IngressList";

  // IngressList is a collection of Ingress.
  export interface Interface {
    // Items is the list of Ingress.
    items: Ingress[];

    // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata?: apisMetaV1.ListMeta;
  }
}

// IngressRule represents the rules mapping the paths under a specified host to the related backend services. Incoming requests are first evaluated for a host match, then routed to the backend associated with the matching IngressRuleValue.
export class IngressRule {
  // Host is the fully qualified domain name of a network host, as defined by RFC 3986. Note the following deviations from the "host" part of the URI as defined in RFC 3986: 1. IPs are not allowed. Currently an IngressRuleValue can only apply to
  //    the IP in the Spec of the parent Ingress.
  // 2. The `:` delimiter is not respected because ports are not allowed.
  // 	  Currently the port of an Ingress is implicitly :80 for http and
  // 	  :443 for https.
  // Both these may change in the future. Incoming requests are matched against the host before the IngressRuleValue. If the host is unspecified, the Ingress routes all traffic based on the specified IngressRuleValue.
  // 
  // Host can be "precise" which is a domain name without the terminating dot of a network host (e.g. "foo.bar.com") or "wildcard", which is a domain name prefixed with a single wildcard label (e.g. "*.foo.com"). The wildcard character '*' must appear by itself as the first DNS label and matches only a single label. You cannot have a wildcard label by itself (e.g. Host == "*"). Requests will be matched against the Host field in the following way: 1. If Host is precise, the request matches this rule if the http host header is equal to Host. 2. If Host is a wildcard, then the request matches this rule if the http host header is to equal to the suffix (removing the first label) of the wildcard rule.
  public host?: string;

  public http?: HTTPIngressRuleValue;
}

// IngressServiceBackend references a Kubernetes Service as a Backend.
export class IngressServiceBackend {
  // Name is the referenced service. The service must exist in the same namespace as the Ingress object.
  public name: string;

  // Port of the referenced service. A port name or port number is required for a IngressServiceBackend.
  public port?: ServiceBackendPort;

  constructor(desc: IngressServiceBackend) {
    this.name = desc.name;
    this.port = desc.port;
  }
}

// IngressSpec describes the Ingress the user wishes to exist.
export class IngressSpec {
  // DefaultBackend is the backend that should handle requests that don't match any rule. If Rules are not specified, DefaultBackend must be specified. If DefaultBackend is not set, the handling of requests that do not match any of the rules will be up to the Ingress controller.
  public defaultBackend?: IngressBackend;

  // IngressClassName is the name of the IngressClass cluster resource. The associated IngressClass defines which controller will implement the resource. This replaces the deprecated `kubernetes.io/ingress.class` annotation. For backwards compatibility, when that annotation is set, it must be given precedence over this field. The controller may emit a warning if the field and annotation have different values. Implementations of this API should ignore Ingresses without a class specified. An IngressClass resource may be marked as default, which can be used to set a default value for this field. For more information, refer to the IngressClass documentation.
  public ingressClassName?: string;

  // A list of host rules used to configure the Ingress. If unspecified, or no rule matches, all traffic is sent to the default backend.
  public rules?: IngressRule[];

  // TLS configuration. Currently the Ingress only supports a single TLS port, 443. If multiple members of this list specify different hosts, they will be multiplexed on the same port according to the hostname specified through the SNI TLS extension, if the ingress controller fulfilling the ingress supports SNI.
  public tls?: IngressTLS[];
}

// IngressStatus describe the current state of the Ingress.
export class IngressStatus {
  // LoadBalancer contains the current status of the load-balancer.
  public loadBalancer?: apiCoreV1.LoadBalancerStatus;
}

// IngressTLS describes the transport layer security associated with an Ingress.
export class IngressTLS {
  // Hosts are a list of hosts included in the TLS certificate. The values in this list must match the name/s used in the tlsSecret. Defaults to the wildcard host setting for the loadbalancer controller fulfilling this Ingress, if left unspecified.
  public hosts?: string[];

  // SecretName is the name of the secret used to terminate TLS traffic on port 443. Field is left optional to allow TLS routing based on SNI hostname alone. If the SNI host in a listener conflicts with the "Host" header field used by an IngressRule, the SNI host is used for termination and value of the Host header is used for routing.
  public secretName?: string;
}

// NetworkPolicy describes what network traffic is allowed for a set of Pods
export class NetworkPolicy implements KubernetesObject {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata: apisMetaV1.ObjectMeta;

  // Specification of the desired behavior for this NetworkPolicy.
  public spec?: NetworkPolicySpec;

  constructor(desc: NetworkPolicy.Interface) {
    this.apiVersion = NetworkPolicy.apiVersion;
    this.kind = NetworkPolicy.kind;
    this.metadata = desc.metadata;
    this.spec = desc.spec;
  }
}

export function isNetworkPolicy(o: any): o is NetworkPolicy {
  return o && o.apiVersion === NetworkPolicy.apiVersion && o.kind === NetworkPolicy.kind;
}

export namespace NetworkPolicy {
  export const apiVersion = "networking.k8s.io/v1";
  export const group = "networking.k8s.io";
  export const version = "v1";
  export const kind = "NetworkPolicy";

  // named constructs a NetworkPolicy with metadata.name set to name.
  export function named(name: string): NetworkPolicy {
    return new NetworkPolicy({metadata: {name}});
  }
  // NetworkPolicy describes what network traffic is allowed for a set of Pods
  export interface Interface {
    // Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata: apisMetaV1.ObjectMeta;

    // Specification of the desired behavior for this NetworkPolicy.
    spec?: NetworkPolicySpec;
  }
}

// NetworkPolicyEgressRule describes a particular set of traffic that is allowed out of pods matched by a NetworkPolicySpec's podSelector. The traffic must match both ports and to. This type is beta-level in 1.8
export class NetworkPolicyEgressRule {
  // List of destination ports for outgoing traffic. Each item in this list is combined using a logical OR. If this field is empty or missing, this rule matches all ports (traffic not restricted by port). If this field is present and contains at least one item, then this rule allows traffic only if the traffic matches at least one port in the list.
  public ports?: NetworkPolicyPort[];

  // List of destinations for outgoing traffic of pods selected for this rule. Items in this list are combined using a logical OR operation. If this field is empty or missing, this rule matches all destinations (traffic not restricted by destination). If this field is present and contains at least one item, this rule allows traffic only if the traffic matches at least one item in the to list.
  public to?: NetworkPolicyPeer[];
}

// NetworkPolicyIngressRule describes a particular set of traffic that is allowed to the pods matched by a NetworkPolicySpec's podSelector. The traffic must match both ports and from.
export class NetworkPolicyIngressRule {
  // List of sources which should be able to access the pods selected for this rule. Items in this list are combined using a logical OR operation. If this field is empty or missing, this rule matches all sources (traffic not restricted by source). If this field is present and contains at least one item, this rule allows traffic only if the traffic matches at least one item in the from list.
  public from?: NetworkPolicyPeer[];

  // List of ports which should be made accessible on the pods selected for this rule. Each item in this list is combined using a logical OR. If this field is empty or missing, this rule matches all ports (traffic not restricted by port). If this field is present and contains at least one item, then this rule allows traffic only if the traffic matches at least one port in the list.
  public ports?: NetworkPolicyPort[];
}

// NetworkPolicyList is a list of NetworkPolicy objects.
export class NetworkPolicyList {
  // APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
  public apiVersion: string;

  // Items is a list of schema objects.
  public items: NetworkPolicy[];

  // Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
  public kind: string;

  // Standard list metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
  public metadata?: apisMetaV1.ListMeta;

  constructor(desc: NetworkPolicyList) {
    this.apiVersion = NetworkPolicyList.apiVersion;
    this.items = desc.items.map((i) => new NetworkPolicy(i));
    this.kind = NetworkPolicyList.kind;
    this.metadata = desc.metadata;
  }
}

export function isNetworkPolicyList(o: any): o is NetworkPolicyList {
  return o && o.apiVersion === NetworkPolicyList.apiVersion && o.kind === NetworkPolicyList.kind;
}

export namespace NetworkPolicyList {
  export const apiVersion = "networking.k8s.io/v1";
  export const group = "networking.k8s.io";
  export const version = "v1";
  export const kind = "NetworkPolicyList";

  // NetworkPolicyList is a list of NetworkPolicy objects.
  export interface Interface {
    // Items is a list of schema objects.
    items: NetworkPolicy[];

    // Standard list metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
    metadata?: apisMetaV1.ListMeta;
  }
}

// NetworkPolicyPeer describes a peer to allow traffic to/from. Only certain combinations of fields are allowed
export class NetworkPolicyPeer {
  // IPBlock defines policy on a particular IPBlock. If this field is set then neither of the other fields can be.
  public ipBlock?: IPBlock;

  // Selects Namespaces using cluster-scoped labels. This field follows standard label selector semantics; if present but empty, it selects all namespaces.
  // 
  // If PodSelector is also set, then the NetworkPolicyPeer as a whole selects the Pods matching PodSelector in the Namespaces selected by NamespaceSelector. Otherwise it selects all Pods in the Namespaces selected by NamespaceSelector.
  public namespaceSelector?: apisMetaV1.LabelSelector;

  // This is a label selector which selects Pods. This field follows standard label selector semantics; if present but empty, it selects all pods.
  // 
  // If NamespaceSelector is also set, then the NetworkPolicyPeer as a whole selects the Pods matching PodSelector in the Namespaces selected by NamespaceSelector. Otherwise it selects the Pods matching PodSelector in the policy's own Namespace.
  public podSelector?: apisMetaV1.LabelSelector;
}

// NetworkPolicyPort describes a port to allow traffic on
export class NetworkPolicyPort {
  // If set, indicates that the range of ports from port to endPort, inclusive, should be allowed by the policy. This field cannot be defined if the port field is not defined or if the port field is defined as a named (string) port. The endPort must be equal or greater than port. This feature is in Alpha state and should be enabled using the Feature Gate "NetworkPolicyEndPort".
  public endPort?: number;

  // The port on the given protocol. This can either be a numerical or named port on a pod. If this field is not provided, this matches all port names and numbers. If present, only traffic on the specified protocol AND port will be matched.
  public port?: pkgUtilIntstr.IntOrString;

  // The protocol (TCP, UDP, or SCTP) which traffic must match. If not specified, this field defaults to TCP.
  public protocol?: string;
}

// NetworkPolicySpec provides the specification of a NetworkPolicy
export class NetworkPolicySpec {
  // List of egress rules to be applied to the selected pods. Outgoing traffic is allowed if there are no NetworkPolicies selecting the pod (and cluster policy otherwise allows the traffic), OR if the traffic matches at least one egress rule across all of the NetworkPolicy objects whose podSelector matches the pod. If this field is empty then this NetworkPolicy limits all outgoing traffic (and serves solely to ensure that the pods it selects are isolated by default). This field is beta-level in 1.8
  public egress?: NetworkPolicyEgressRule[];

  // List of ingress rules to be applied to the selected pods. Traffic is allowed to a pod if there are no NetworkPolicies selecting the pod (and cluster policy otherwise allows the traffic), OR if the traffic source is the pod's local node, OR if the traffic matches at least one ingress rule across all of the NetworkPolicy objects whose podSelector matches the pod. If this field is empty then this NetworkPolicy does not allow any traffic (and serves solely to ensure that the pods it selects are isolated by default)
  public ingress?: NetworkPolicyIngressRule[];

  // Selects the pods to which this NetworkPolicy object applies. The array of ingress rules is applied to any pods selected by this field. Multiple network policies can select the same set of pods. In this case, the ingress rules for each are combined additively. This field is NOT optional and follows standard label selector semantics. An empty podSelector matches all pods in this namespace.
  public podSelector: apisMetaV1.LabelSelector;

  // List of rule types that the NetworkPolicy relates to. Valid options are ["Ingress"], ["Egress"], or ["Ingress", "Egress"]. If this field is not specified, it will default based on the existence of Ingress or Egress rules; policies that contain an Egress section are assumed to affect Egress, and all policies (whether or not they contain an Ingress section) are assumed to affect Ingress. If you want to write an egress-only policy, you must explicitly specify policyTypes [ "Egress" ]. Likewise, if you want to write a policy that specifies that no egress is allowed, you must specify a policyTypes value that include "Egress" (since such a policy would not include an Egress section and would otherwise default to just [ "Ingress" ]). This field is beta-level in 1.8
  public policyTypes?: string[];

  constructor(desc: NetworkPolicySpec) {
    this.egress = desc.egress;
    this.ingress = desc.ingress;
    this.podSelector = desc.podSelector;
    this.policyTypes = desc.policyTypes;
  }
}

// ServiceBackendPort is the service port being referenced.
export class ServiceBackendPort {
  // Name is the name of the port on the Service. This is a mutually exclusive setting with "Number".
  public name?: string;

  // Number is the numerical port number (e.g. 80) on the Service. This is a mutually exclusive setting with "Name".
  public number?: number;
}