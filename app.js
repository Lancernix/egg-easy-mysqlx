'use strict';

const mysql = require('./lib/index');

module.exports = app => {
  if (app.config.mysql.app) mysql(app);
};
