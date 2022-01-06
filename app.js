'use strict';

const mysqlx = require('./lib/index');

module.exports = app => {
  if (app.config.mysqlx.app) mysqlx(app);
};
