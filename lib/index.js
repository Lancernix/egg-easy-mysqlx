'use strict';

import assert from 'assert';
import mysqlx from 'easy-mysqlx';

const { Client } = mysqlx;

let count = 0;

export default app => {
  app.addSingleton('mysqlx', createOneClient);
};

const createOneClient = (config, app) => {
  assert(
    config.host && config.port && config.user && config.database,
    `[egg-mysqlx] 'host: ${config.host}', 'port: ${config.port}', 'user: ${config.user}', 'database: ${config.database}' are required on config`,
  );

  app.coreLogger.info('[egg-mysqlx] connecting %s@%s:%s/%s', config.user, config.host, config.port, config.database);
  const client = new Client(config);

  app.beforeStart(async () => {
    const rows = await client.query('select now() as currentTime;');
    const index = count++;
    app.coreLogger.info(`[egg-mysqlx] instance[${index}] status OK, rds currentTime: ${rows[0].currentTime}`);
  });
  return client;
};
