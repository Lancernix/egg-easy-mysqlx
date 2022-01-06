import 'egg';
import Client from 'easy-mysqlx/lib/typing/client';

declare module 'egg' {
  interface Application {
    mysqlx: Client;
  }
}




