'use strict';

const mysql = require('./lib/index');

module.exports = agent => {
  if (agent.config.mysql.agent) mysql(agent);
};
