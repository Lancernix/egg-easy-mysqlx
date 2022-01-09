# egg-easy-mysqlx

A mysql plugin for eggjs, provides common curd APIs and more operators, also adds typescript support. It can be regarded as an upgrade of egg-mysql.

## Start

```JS
// config/plugin.js
module.exports = {
  ...
  mysqlx: {
    enable: true,
    package: 'egg-easy-mysqlx',
  },
  ...
};
```

## Config

The configuration is the same as that of egg-mysql. For more detail, please refer to the [egg-mysql configuration page](https://eggjs.org/en/tutorials/mysql.html#egg-mysql).

```JS
// config/config.default.js
module.exports = appInfo => {
  ...
  config.mysqlx = {
    client: {
      host: 'localhost',
      port: 3306,
      user: 'user',
      password: '123456',
      database: 'test',
    },
    app: true,
    agent: false,
  };
  ...
  return {
    ...config,
    ...userConfig,
  };
};

```

## Basic Use

> Unless otherwise specified, the parameters of the following methods are objects.

### Read

Use `select` method can select data what you want. The object parameter of the method includes `table` 、 `column` 、 `where` 、 `limit` 、 `offset` and `order`.

* `table` —— table name（required）
* `column` —— columns that you want（not required）
* `where` —— select conditions（not required）
* `limit` —— number of returned data，default is 1（not required）
* `offset` —— offset，default is 0（not required）
* `order` —— order（not required）

The result is an array of objects。

`where` is an object with some given keys. Each key represents a logical operator in the sql statement:

* `eq` —— equal（=）
* `ne` —— not equal（!=）
* `gt` —— greater than（>）
* `ge` —— greater than or equal（>=）
* `lt` —— less than（<）
* `le` —— less than or equal（<=）
* `in` —— in
* `ni` —— not in
* `bw` —— between ... and ...
* `like` —— like
* `or` —— or

The value corresponding to each key above is also an object（except `or`，it's corresponding value is an array）, the object is the field and corresponding value in a data table. For example：

* `eq: { name: 'tom' }` ==> `name = 'tom'`
* `eq: { name: 'tom', age: 6 }` ==> `name = 'tom' AND age = 6`
* `bw: { age: [6, 12] }` ==> `age BETWEEN 6 AND 12`
* `or: [{ eq: { name: 'tom' } }, { eq: { name: 'jerry' } }]` ==> `name = 'tom' OR name = 'jerry'`

```JS
const result = await this.app.mysqlx.select({
  table: 'test_table',
  column: ['id', 'name'],
  where: {
    or: [{ eq: { name: 'harden', status: 0 }, le: { age: 30 } }, { eq: { name: 'tim' } }],
  },
  limit: 10,
});
// result
result = [
  { id: 24, name: 'tim' },
  { id: 57, name: 'harden' },
];

const result = await this.app.mysqlx.select({
  table: 'test_table',
  // empty column is equivalent to undefined, both represent SELECT * FROM xxx
  column: [],
  where: {
    or: [{ eq: { name: 'harden', status: 0 }, le: { age: 30 } }, { eq: { name: 'tim' } }],
  },
});
// result
result = [
  {
    id: 24,
    name: 'tim',
    age: 90,
    status: 1,
    created_time: '2021-12-31 17:35:41',
    msg: 'message',
  },
];
```

### Create

Use `insert` method can execute single or batch insert. The object parameter of the method includes `table` and `value`.

* `table` —— table name（required）
* `value` —— When a single data is inserted, it is an object; In case of batch insertion, it is an array of objects（required）

The result is judged by `affectedRows`.

```JS
// single insert
const result = await this.app.mysqlx.insert({
  table: 'test_table',
  value: {
    name: 'timo',
    age: '9',
    status: 0,
  },
});
// insert success
result.affectedRows ==> 1;

// multi insert
const result = await this.app.mysqlx.insert({
  table: 'test_table',
  value: [
    {
      name: 'yasuo',
      age: '21',
      status: 1,
    },
    {
      name: 'yohn',
      age: '24',
      status: 1,
    },
    {
      name: 'akl',
      age: '26',
      status: 0,
    },
  ],
});
// insert success
result.affectedRows ==> 3;
```

### Update

Use `update` method can update data. The object parameter of the method includes `table` 、`value` and `where`.

* `table` —— table name（required）
* `value` —— update data（required）
* `where` —— condition（required）TODO:

The result is also judged by `affectedRows`.

```JS
const result = await this.app.mysqlx.update({
  table: 'test_table',
  value: { msg: 'update timo message' },
  where: {
    eq: { name: 'timo' },
  },
});
```

### Delete

Use `delete` method can delete data from table。The object parameter of the method includes `table` and `where`.

* `table` —— table（required）
* `where` —— condition（not required）

The result is also judged by `affectedRows`.

```JS
const result = await this.app.mysqlx.delete({
  table: 'test_table',
  where: {
    eq: { name: 'timo' },
  },
});

// be care! All data in the table will be deleted when missing where
const result = await this.app.mysqlx.delete({
  table: 'test_table',
});
```

### Count

为了方便使用，也提供了 `count` 方法用于查询符合条件的数据条数。`count` 方法的参数同 `delete` 方法。

The result is a number.

```JS
const result = await this.app.mysqlx.count({
  table: TABLE,
  where: {
    eq: { status: 1 },
  },
});
// result
result ==> 13;
```

### Query

可能上述提供的方法不能完全满足实际需求，我们同样也提供了 `query` 方法用于手写 sql 语句。`query` 方法的参数**不是对象**，其有两个参数：`sql` 和 `values`。

* `sql` —— sql string（required）
* `values` —— corresponding values in where clause（not required）

```JS
const result = await this.app.mysqlx.query(`SELECT id, name, age FROM test_table WHERE id >= ? AND status = ?;`, [50, 0]);
```

The above usage is recommended. In this way, the plugin will preprocess the statements, which can effectively prevent sql injection.

如果习惯使用拼接字符串，则需要使用 `escape` 方法对传入的值转义一下，同样也可以防止 sql 注入。

```JS
const escapedId = this.app.mysqlx.escape(id);
const escapedStatus = this.app.mysqlx.escape(status);
const result = await this.app.mysqlx.query(`SELECT id, name, age FROM test_table WHERE id >= ${escapedId} AND status = ${escapedStatus};`);
```

## Transaction

mysql 一个事务将一组连续的数据库操作放在一个单一的工作单元来执行。该组内的每个单独的操作是成功，事务才能成功。如果事务中的任何操作失败，则整个事务将失败。

插件同样也提供了**手动**和**自动**两种事务处理的方式。

### Manual Transaction

`beginTransaction` 、 `commit` 和 `rollback` 用于手动执行事务。

```JS
// start transaction
const tran = await this.app.mysqlx.beginTransaction();
  try {
    const res = await tran.select({
      table: 'test_table',
      column: ['id'],
      where: { eq: { name: 'yohn' } },
    });
    const res1 = await tran.update({
      table: 'test_table',
      value: { msg: 'update yohn message wohhhhh' },
      where: { eq: { id: res[0].id } },
    });
    // success, commit
    await tran.commit();
    return true;
  } catch (error) {
    // error, rollback
    await tran.rollback();
    throw error;
  }
```

### Auto Transaction

`autoTransaction` 方法用于自动执行事务。其有两个参数：`scope` 和 `ctx`。

* `scope` —— 一个包含多次 CURD 操作的异步函数
* `ctx` —— 上下文对象，即 eggjs 中的 ctx，传入 ctx 可以保证即便在出现事务嵌套的情况下，一次请求中同时只有一个激活状态的事务

```JS
const result = await this.app.mysqlx.autoTransaction(async tran => {
  const res = await tran.select({
    table: TABLE,
    column: ['id'],
    where: { eq: { name: 'yohn' } },
  });
  expect(res).toEqual([{ id: 60 }]);
  const res1 = await tran.update({
    table: TABLE,
    value: { msg: 'update yohn message' },
    where: { eq: { id: res[0].id } },
  });
  expect(res1.affectedRows).toEqual(1);
  const result = await tran.insert({
    table: TABLE,
    value: {
      name: 'vn',
      age: 77,
    },
  });
  return result;
});
```

## Issue

[egg-easy-mysqlx issues](https://github.com/Lancernix/egg-easy-mysqlx/issues).

## License

[MIT](LICENSE)
