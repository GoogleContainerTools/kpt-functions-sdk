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

import _ from 'lodash';
import { ObjectMeta } from './gen/io.k8s.apimachinery.pkg.apis.meta.v1';
import { Configs, KubernetesObject } from './types';
import { generalResult } from './result';

class Role implements KubernetesObject {
  readonly apiVersion: string = 'rbac.authorization.k8s.io/v1';
  readonly kind: string = 'Role';
  metadata: ObjectMeta;

  roleField = '';

  constructor(name: string, roleField?: string) {
    if (roleField) {
      this.roleField = roleField;
    }
    this.metadata = { name };
  }
}

function isRole(o: KubernetesObject): o is Role {
  return o.apiVersion === 'rbac.authorization.k8s.io/v1' && o.kind === 'Role';
}

class Pod implements KubernetesObject {
  readonly apiVersion: string = 'v1';
  readonly kind: string = 'Pod';
  metadata: ObjectMeta;

  roleBindingField = '';

  constructor(name: string) {
    this.metadata = { name };
  }
}

function isPod(o: KubernetesObject): o is Pod {
  return o.apiVersion === 'v1' && o.kind === 'Pod';
}

describe('getAll', () => {
  it('works on empty Configs', () => {
    const configs = new Configs();
    const all = configs.getAll();

    expect(all).toEqual([]);
  });

  it('returns one object if only one is present', () => {
    const configs = new Configs([new Role('alice')]);
    const all = configs.getAll();

    expect(all).toEqual([new Role('alice')]);
  });

  it('returns two objects if both are present', () => {
    const configs = new Configs([new Role('alice'), new Pod('backend')]);
    const all = configs.getAll();

    expect(all).toEqual([new Role('alice'), new Pod('backend')]);
  });
});

describe('get', () => {
  it('only gets Roles if passed isRoles', () => {
    const configs = new Configs([
      new Role('alice'),
      new Role('bob'),
      new Pod('frontend'),
      new Pod('backend'),
    ]);
    const roles = configs.get(isRole);

    expect(roles).toEqual([new Role('alice'), new Role('bob')]);
  });

  it('only gets Pods if passed isPods', () => {
    const configs = new Configs([
      new Role('alice'),
      new Role('bob'),
      new Pod('frontend'),
      new Pod('backend'),
    ]);
    const roles = configs.get(isPod);

    expect(roles).toEqual([new Pod('backend'), new Pod('frontend')]);
  });

  it('sorts values passed to the constructor', () => {
    const names = [
      'ailen',
      'bodil',
      'caligula',
      'freya',
      'gerulf',
      'moirin',
      'onisimu',
      'tasnim',
      'tinek',
      'walherich',
    ];
    const roles = names.map(name => new Role(name));
    _.shuffle(roles);

    const configs = new Configs(roles);

    expect(configs.getAll()).toEqual(names.map(name => new Role(name)));
  });
});

describe('insert', () => {
  it('inserts values into Configs', () => {
    const configs = new Configs();

    configs.insert(new Role('alice'));

    expect(configs.getAll()).toEqual([new Role('alice')]);
  });

  it('overwrites previous values Configs', () => {
    const configs = new Configs([new Role('alice', 'backend')]);
    configs.insert(new Role('alice', 'admin'));

    configs.insert(new Role('alice', 'qa'));

    expect(configs.getAll()).toEqual([new Role('alice', 'qa')]);
  });

  it('sorts values passed to insert', () => {
    const names = [
      'colbert',
      'dzafer',
      'ina',
      'kay',
      'naama',
      'sephora',
      'slaven',
      'terra',
      'theo',
      'zuzka',
    ];
    const roles = names.map(name => new Role(name));
    _.shuffle(roles);

    const configs = new Configs();
    configs.insert(...roles);

    expect(configs.getAll()).toEqual(names.map(name => new Role(name)));
  });
});

describe('delete', () => {
  it('does not throw if value is missing', () => {
    const configs = new Configs();
    configs.delete(new Role('alice'));

    expect(configs.getAll()).toEqual([]);
  });

  it('removes values from Configs', () => {
    const configs = new Configs([new Role('alice')]);
    configs.delete(new Role('alice'));

    expect(configs.getAll()).toEqual([]);
  });

  it('does not require objects to equal to remove object with key', () => {
    const configs = new Configs([new Role('alice', 'qa')]);
    configs.delete(new Role('alice', 'admin'));

    expect(configs.getAll()).toEqual([]);
  });

  it('respects namespace boundaries', () => {
    const r1 = new Role('alice', 'qa');
    r1.metadata.namespace = 'shipping';
    const configs = new Configs([r1]);

    const r2 = new Role('alice', 'qa');
    r2.metadata.namespace = 'frontend';
    configs.delete(new Role('alice'));

    expect(configs.getAll()).toEqual([r1]);
  });
});

describe('groupBy', () => {
  const keyFn = (o: KubernetesObject) => o.metadata.name.charAt(0) || '';

  it('returns empty if passed empty', () => {
    const configs = new Configs();
    const grouped = configs.groupBy(keyFn);

    expect(grouped).toEqual([]);
  });

  it('returns single element if passed single element', () => {
    const configs = new Configs([new Role('alice')]);
    const grouped = configs.groupBy(keyFn);

    expect(grouped).toEqual([['a', [new Role('alice')]]]);
  });

  it('partitions into two if they map to different keys', () => {
    const configs = new Configs([new Role('alice'), new Role('bob')]);
    const grouped = configs.groupBy(keyFn);

    expect(grouped).toEqual([
      ['a', [new Role('alice')]],
      ['b', [new Role('bob')]],
    ]);
  });

  it('uses a single partition for elements mapping to the same key', () => {
    const configs = new Configs([new Role('alice'), new Role('andrew')]);
    const grouped = configs.groupBy(keyFn);

    expect(grouped).toEqual([['a', [new Role('alice'), new Role('andrew')]]]);
  });
});

describe('functionConfig', () => {
  it('ConfigMap kind', () => {
    const cm = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: 'my-config',
      },
      data: {
        k1: 'v1',
        k2: 'v2',
      },
    };
    const configs = new Configs(undefined, cm);
    expect(configs.getFunctionConfig()).toEqual(cm);
    expect(configs.getFunctionConfigValue('k1')).toEqual('v1');
    expect(configs.getFunctionConfigValue('k2')).toEqual('v2');
    expect(configs.getFunctionConfigValue('k3')).toBeUndefined();
    expect(configs.getFunctionConfigValueOrThrow('k1')).toEqual('v1');
    expect(() => configs.getFunctionConfigValueOrThrow('k3')).toThrow();
  });

  it('no object', () => {
    const configs = new Configs(undefined);
    expect(configs.getFunctionConfig()).toBeUndefined();
    expect(configs.getFunctionConfigValue('k3')).toBeUndefined();
    expect(() => configs.getFunctionConfigValueOrThrow('k3')).toThrow();
  });

  it('other kinds', () => {
    const r1 = new Role('alice');
    const configs = new Configs(undefined, r1);
    expect(configs.getFunctionConfig()).toEqual(r1);
    expect(() => configs.getFunctionConfigValue('k1')).toThrow();
    expect(() => configs.getFunctionConfigValueOrThrow('k1')).toThrow();
  });
});

describe('results', () => {
  it('empty result', () => {
    const configs = new Configs();
    const results = configs.getResults();

    expect(results).toEqual([]);
  });

  it('one result', () => {
    const configs = new Configs();
    configs.addResults({ message: 'hello', severity: 'error' });
    const results = configs.getResults();

    expect(results).toEqual([{ message: 'hello', severity: 'error' }]);
  });

  it('multiple results', () => {
    const configs = new Configs();
    configs.addResults(generalResult('a'), generalResult('b'));
    const results = configs.getResults();

    expect(results).toEqual([generalResult('a'), generalResult('b')]);
  });
});
