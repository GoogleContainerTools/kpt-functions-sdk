import { Configs, TestRunner } from 'kpt-functions';
import { annotateConfig } from './annotate_config';
import { ConfigMap, Namespace } from './gen/io.k8s.api.core.v1';
import { FunctionConfigError } from 'kpt-functions';

const RUNNER = new TestRunner(annotateConfig);
const TEST_NAMESPACE = 'testNamespace';
const TEST_ANNOTATION_NAME = 'configsupport';
const TEST_ANNOTATION_VALUE = 'ops-supported';
const FUNC_CONFIG: ConfigMap = new ConfigMap({
  metadata: { name: 'config' },
  data: {
    annotation_name: TEST_ANNOTATION_NAME,
    annotation_value: TEST_ANNOTATION_VALUE,
  },
});

describe('annotateConfig', () => {
  it(
    'empty input ok',
    RUNNER.assertCallback(new Configs(undefined, FUNC_CONFIG), 'unchanged')
  );

  it(
    'requires functionConfig',
    RUNNER.assertCallback(undefined, undefined, FunctionConfigError)
  );

  it('adds annotation namespace when metadata.annotations is undefined', async () => {
    const input = new Configs(undefined, FUNC_CONFIG);
    input.insert(Namespace.named(TEST_NAMESPACE));

    const output = new Configs();
    output.insert(
      new Namespace({
        metadata: {
          name: TEST_NAMESPACE,
          annotations: { [TEST_ANNOTATION_NAME]: TEST_ANNOTATION_VALUE },
        },
      })
    );

    await RUNNER.assert(input, output);
  });

  it('adds annotation to namespace when metadata.annotations is defined', async () => {
    const input = new Configs(undefined, FUNC_CONFIG);
    input.insert(
      new Namespace({
        metadata: {
          name: TEST_NAMESPACE,
          annotations: { a: 'b' },
        },
      })
    );

    const output = new Configs();
    output.insert(
      new Namespace({
        metadata: {
          name: TEST_NAMESPACE,
          annotations: {
            a: 'b',
            [TEST_ANNOTATION_NAME]: TEST_ANNOTATION_VALUE,
          },
        },
      })
    );

    await RUNNER.assert(input, output);
  });
});
