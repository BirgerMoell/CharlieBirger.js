const app = require('../app.js');

describe('app', () => {
  it('predicts value for y1 given x, y and x1', () => {
    const x = [1, 2, 3, 4];
    const y = [2, 4, 6, 8];
    const x1 = [5];
    const y1 = [10];
    expect(app.predict(x, y, x1)).resolves.toBe(y1);
  });
});
