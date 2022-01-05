'use strict';

exports.mysql = {
  default: {
    database: null,
    connectionLimit: 5,
  },
  app: true,
  agent: false,

  // single database
  // client: {
  //   host: 'host',
  //   port: 'port',
  //   user: 'user',
  //   password: 'password',
  //   database: 'database',
  // },

  // multi databases
  // clients: {
  //   db1: {
  //     host: 'host',
  //     port: 'port',
  //     user: 'user',
  //     password: 'password',
  //     database: 'database',
  //   },
  //   db2: {
  //     host: 'host',
  //     port: 'port',
  //     user: 'user',
  //     password: 'password',
  //     database: 'database',
  //   },
  // },
};
