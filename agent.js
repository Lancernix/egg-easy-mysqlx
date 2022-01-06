'use strict';

const mysqlx = require('./lib/index');

module.exports = agent => {
  if (agent.config.mysqlx.agent) mysqlx(agent);
};
