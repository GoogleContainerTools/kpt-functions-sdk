import { Configs, TestRunner } from 'kpt-functions';
import { myFunc } from './my_func';

const RUNNER = new TestRunner(myFunc);

describe('myFunc', () => {
  it('does something', async () => {
    // TODO: Populate the input to the function.
    const input = new Configs();

    // TODO: Populate the expected output of the function.
    const expectedOutput = new Configs();

    await RUNNER.assert(input, expectedOutput);
  });
});
