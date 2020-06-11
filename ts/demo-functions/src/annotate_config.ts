import { Configs, isKubernetesObject, addAnnotation } from 'kpt-functions';

const ANNOTATION_NAME = 'annotation_name';
const ANNOTATION_VALUE = 'annotation_value';

export async function annotateConfig(configs: Configs) {
  const annotationName = configs.getFunctionConfigValueOrThrow(ANNOTATION_NAME);
  const annotationValue = configs.getFunctionConfigValueOrThrow(
    ANNOTATION_VALUE
  );
  configs
    .get(isKubernetesObject)
    .forEach((n) => addAnnotation(n, annotationName, annotationValue));
}

annotateConfig.usage = `
Adds an annotation to all configuration files.

Configured using a ConfigMap with the following keys:

${ANNOTATION_NAME}: Annotation name to add to configs.
${ANNOTATION_VALUE}: Annotation value to add to configs.

Example:

To add an annotation 'org: sre-supported' to Namespaces:

apiVersion: v1
kind: ConfigMap
data:
  ${ANNOTATION_NAME}: org
  ${ANNOTATION_VALUE}: sre-supported
metadata:
  name: my-config
`;
