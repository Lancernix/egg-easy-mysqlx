import { Application } from 'egg';
import mock from 'egg-mock';

describe('test/mysqlx.test.ts', () => {
  let app: Application;
  before(() => {
    app = mock.app({
      baseDir: 'apps/mysqlx-test',
    });
    return app.ready();
  });

  beforeEach(async () => {});

  after(() => {
    app.close();
  });
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest().get('/').expect('hi, mysqlx').expect(200);
  });
});
