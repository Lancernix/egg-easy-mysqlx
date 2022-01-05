'use strict';

const mock = require('egg-mock');

describe('test/mysqlxx.test.ts', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/mysqlxx-test',
    });
    return app.ready();
  });

  beforeEach(async () => {});

  after(() => {
    app.close();
  });
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest().get('/').expect('hi, mysqlx')
      .expect(200);
  });
});
