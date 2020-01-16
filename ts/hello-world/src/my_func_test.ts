import { Configs } from '@googlecontainertools/kpt-functions';
import { myFunc } from './my_func';

describe('myFunc', () => {
  it('does something', () => {
    // 1. TODO: Create test fixture for Configs consumed by the function.
    const actualConfigs = new Configs();

    // 2. Invoke the function.
    myFunc(actualConfigs);

    // 3. TODO: Create test fixture for Configs expected to be returned by the function.
    const expectedConfigs = new Configs();

    // 4. TODO: Assert function behavior including any side-effects.
    expect(actualConfigs.getAll()).toEqual(expectedConfigs.getAll());
  });
});
