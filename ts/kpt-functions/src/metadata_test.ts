/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ObjectMeta } from './gen/io.k8s.apimachinery.pkg.apis.meta.v1';
import {
  addAnnotation,
  addLabel,
  getAnnotation,
  getLabel,
  removeAnnotation,
  removeLabel,
} from './metadata';
import { KubernetesObject } from './types';

class Namespace implements KubernetesObject {
  public readonly apiVersion: string = 'v1';
  public readonly kind: string = 'Namespace';
  public metadata: ObjectMeta;

  constructor(name: string) {
    this.metadata = { name };
  }
}

describe('getAnnotation', () => {
  it('returns undefined on undefined annotations', () => {
    const ns = new Namespace('foo');
    expect(ns.metadata.annotations).toBeUndefined();

    const value = getAnnotation(ns, 'bar');
    expect(value).toBeUndefined();
  });

  it('returns defined if annotation exists', () => {
    const ns = new Namespace('foo');
    ns.metadata.annotations = { bar: 'qux' };

    const value = getAnnotation(ns, 'bar');
    expect(value).toBe('qux');
  });

  it('returns undefined if annotations defined but not specific annotation', () => {
    const ns = new Namespace('foo');
    ns.metadata.annotations = { baz: 'qux' };

    const value = getAnnotation(ns, 'bar');
    expect(value).toBeUndefined();
  });
});

describe('addAnnotation', () => {
  it('works on undefined annotations', () => {
    const ns = new Namespace('foo');
    expect(ns.metadata.annotations).toBeUndefined();

    addAnnotation(ns, 'bar', 'qux');
    expect(ns.metadata.annotations).toBeDefined();
    expect(ns.metadata.annotations!['bar']).toBe('qux');
  });

  it('works on defined annotations', () => {
    const ns = new Namespace('foo');
    ns.metadata.annotations = { bar: 'qux' };

    addAnnotation(ns, 'baz', 'xem');
    expect(ns.metadata.annotations).toBeDefined();
    expect(ns.metadata.annotations!['baz']).toBe('xem');
  });

  it('overwrites existing values', () => {
    const ns = new Namespace('foo');
    ns.metadata.annotations = { bar: 'qux' };

    addAnnotation(ns, 'bar', 'bar');
    expect(ns.metadata.annotations).toBeDefined();
    expect(ns.metadata.annotations!['bar']).toBe('bar');
  });
});

describe('removeAnnotation', () => {
  it('works on undefined annotations', () => {
    const ns = new Namespace('foo');
    expect(ns.metadata.annotations).toBeUndefined();

    removeAnnotation(ns, 'bar');
    expect(ns.metadata.annotations).toBeUndefined();
  });

  it('only removes specific annotation', () => {
    const ns = new Namespace('foo');
    ns.metadata.annotations = { bar: 'qux', baz: 'xem' };

    removeAnnotation(ns, 'bar');
    expect(ns.metadata.annotations).toBeDefined();
    expect(ns.metadata.annotations!['bar']).toBeUndefined();
    expect(ns.metadata.annotations!['baz']).toBe('xem');
  });

  it('removes annotations if no more annotations are left', () => {
    const ns = new Namespace('foo');
    ns.metadata.annotations = { bar: 'qux' };

    removeAnnotation(ns, 'bar');
    expect(ns.metadata.annotations).toBeUndefined();
  });
});

describe('getLabel', () => {
  it('returns undefined on undefined labels', () => {
    const ns = new Namespace('foo');
    expect(ns.metadata.labels).toBeUndefined();

    const value = getLabel(ns, 'bar');
    expect(value).toBeUndefined();
  });

  it('returns defined if label exists', () => {
    const ns = new Namespace('foo');
    ns.metadata.labels = { bar: 'qux' };

    const value = getLabel(ns, 'bar');
    expect(value).toBe('qux');
  });

  it('returns undefined if labels defined but not specific label', () => {
    const ns = new Namespace('foo');
    ns.metadata.labels = { baz: 'qux' };

    const value = getLabel(ns, 'bar');
    expect(value).toBeUndefined();
  });
});

describe('addLabel', () => {
  it('works on undefined labels', () => {
    const ns = new Namespace('foo');
    expect(ns.metadata.labels).toBeUndefined();

    addLabel(ns, 'bar', 'qux');
    expect(ns.metadata.labels).toBeDefined();
    expect(ns.metadata.labels!['bar']).toBe('qux');
  });

  it('works on defined labels', () => {
    const ns = new Namespace('foo');
    ns.metadata.labels = { bar: 'qux' };

    addLabel(ns, 'baz', 'xem');
    expect(ns.metadata.labels).toBeDefined();
    expect(ns.metadata.labels!['baz']).toBe('xem');
  });

  it('overwrites existing values', () => {
    const ns = new Namespace('foo');
    ns.metadata.labels = { bar: 'qux' };

    addLabel(ns, 'bar', 'bar');
    expect(ns.metadata.labels).toBeDefined();
    expect(ns.metadata.labels!['bar']).toBe('bar');
  });
});

describe('removeLabel', () => {
  it('works on undefined labels', () => {
    const ns = new Namespace('foo');
    expect(ns.metadata.labels).toBeUndefined();

    removeLabel(ns, 'bar');
    expect(ns.metadata.labels).toBeUndefined();
  });

  it('only removes specific label', () => {
    const ns = new Namespace('foo');
    ns.metadata.labels = { bar: 'qux', baz: 'xem' };

    removeLabel(ns, 'bar');
    expect(ns.metadata.labels).toBeDefined();
    expect(ns.metadata.labels!['bar']).toBeUndefined();
    expect(ns.metadata.labels!['baz']).toBe('xem');
  });

  it('removes labels if no more labels are left', () => {
    const ns = new Namespace('foo');
    ns.metadata.labels = { bar: 'qux' };

    removeLabel(ns, 'bar');
    expect(ns.metadata.labels).toBeUndefined();
  });
});
