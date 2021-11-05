import { Configs } from './types';
import { runFnWithConfigs } from './run';
import {
  addAnnotation,
  removeAnnotation,
  SOURCE_PATH_ANNOTATION,
  SOURCE_INDEX_ANNOTATION,
  ID_ANNOTATION,
  LEGACY_SOURCE_PATH_ANNOTATION,
  LEGACY_SOURCE_INDEX_ANNOTATION,
  LEGACY_ID_ANNOTATION,
} from './metadata';
import { ConfigMap } from './gen/io.k8s.api.core.v1';

describe('test reconcile annotations', () => {
  it('input only have new annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateNewAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input only have legacy annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateLegacyAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input only have new annotations, but fn insert legacy annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateLegacyAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input only have legacy annotations, but fn insert new annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateNewAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input has both new and legacy annotations, fn modify the new annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateNewAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input has both new and legacy annotations, fn drops the legacy annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(removeLegacyAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input has both new and legacy annotations, fn drops the new annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(removeNewAnnotations, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input has both new and legacy annotations, fn updates new annotations and drops the legacy annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateNewAndRemoveLegacy, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });

  it('input has both new and legacy annotations, fn updates legacy annotations and drops the new annotations', async () => {
    const cm = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(cm, SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, ID_ANNOTATION, '99');
    addAnnotation(cm, LEGACY_SOURCE_PATH_ANNOTATION, 'x.yaml');
    addAnnotation(cm, LEGACY_SOURCE_INDEX_ANNOTATION, '0');
    addAnnotation(cm, LEGACY_ID_ANNOTATION, '99');
    const objects = new Configs([cm]);

    await runFnWithConfigs(updateLegacyAndRemoveNew, objects);

    const expectedCM = new ConfigMap({
      metadata: {
        name: 'foo',
      },
    });
    addAnnotation(expectedCM, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, ID_ANNOTATION, '99');
    addAnnotation(expectedCM, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(expectedCM, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    addAnnotation(expectedCM, LEGACY_ID_ANNOTATION, '99');
    const expectedObjects = new Configs([expectedCM]);
    expect(objects).toEqual(expectedObjects);
  });
});

async function updateNewAnnotations(configs: Configs) {
  for (const obj of configs.getAll()) {
    addAnnotation(obj, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(obj, SOURCE_INDEX_ANNOTATION, '1');
  }
}
updateNewAnnotations.usage = 'update new path and index annotations';

async function updateLegacyAnnotations(configs: Configs) {
  for (const obj of configs.getAll()) {
    addAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
  }
}
updateLegacyAnnotations.usage = 'update legacy path and index annotations';

async function removeNewAnnotations(configs: Configs) {
  for (const obj of configs.getAll()) {
    removeAnnotation(obj, SOURCE_PATH_ANNOTATION);
    removeAnnotation(obj, SOURCE_INDEX_ANNOTATION);
  }
}
removeNewAnnotations.usage = 'remove new path and index annotations';

async function removeLegacyAnnotations(configs: Configs) {
  for (const obj of configs.getAll()) {
    removeAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION);
    removeAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION);
  }
}
removeLegacyAnnotations.usage = 'remove legacy path and index annotations';

async function updateNewAndRemoveLegacy(configs: Configs) {
  for (const obj of configs.getAll()) {
    addAnnotation(obj, SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(obj, SOURCE_INDEX_ANNOTATION, '1');
    removeAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION);
    removeAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION);
  }
}
updateNewAndRemoveLegacy.usage =
  'update new annotations and remove legacy annotations';

async function updateLegacyAndRemoveNew(configs: Configs) {
  for (const obj of configs.getAll()) {
    addAnnotation(obj, LEGACY_SOURCE_PATH_ANNOTATION, 'y.yaml');
    addAnnotation(obj, LEGACY_SOURCE_INDEX_ANNOTATION, '1');
    removeAnnotation(obj, SOURCE_PATH_ANNOTATION);
    removeAnnotation(obj, SOURCE_INDEX_ANNOTATION);
  }
}
updateLegacyAndRemoveNew.usage =
  'update legacy annotations and remove new annotations';
