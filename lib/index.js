'use strict';

const assert = require('assert');
const Client = require('easy-mysqlx').default;

let count = 0;

module.exports = app => {
  app.addSingleton('mysqlx', createOneClient);
};

function createOneClient(config, app) {
  assert(
    config.host && config.port && config.user && config.database,
    `[egg-easy-mysqlx] 'host: ${config.host}', 'port: ${config.port}', 'user: ${config.user}', 'database: ${config.database}' are required on config`,
  );

  app.coreLogger.info(
    '[egg-easy-mysqlx] connecting %s@%s:%s/%s',
    config.user,
    config.host,
    config.port,
    config.database,
  );
  const client = new Client(config);

  app.beforeStart(async () => {
    const rows = await client.query('select now() as currentTime;');
    const index = count++;
    app.coreLogger.info(`[egg-easy-mysqlx] instance[${index}] status OK, rds currentTime: ${rows[0].currentTime}`);
  });
  return client;
}
