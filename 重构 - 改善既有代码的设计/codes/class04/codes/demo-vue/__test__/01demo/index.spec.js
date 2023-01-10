import { sampleProvinceData } from '../../src/01demo/index';
import Province from '../../src/01demo/province';

describe('province', () => {
  it('shortfall',  function() {
    const asia = new Province(sampleProvinceData());
    expect(asia._totalProduction).toBe(25);
  })
})