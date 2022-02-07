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
* `limit` —— number of returned data（not required）
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
* `where` —— condition（not required）

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

### Get

Sometimes we will use unique key for query, so the `get` method is also provided to query **a piece of** data that meets the conditions. The parameters of the `get` method are similar to those of the select method, but there are no `offset` and `limit`.

The result is a object.

```JS
const result = await this.app.mysqlx.get({
  table: 'test_table',
  column: ['id', 'name'],
  where: {
    eq: { id: 2 },
  },
});
// result
result = { id: 2, name: 'tom' };
```

### Count

For ease of use, the `count` method is also provided to query the number of data. The parameters of `count` method are the same as those of `delete` method.

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

Maybe the above methods can not fully meet the actual needs. We also provide the `query` method for handwritten SQL statements. The parameter of the `query` method is **not an object**. It has two parameters: `sql` and `values`.

* `sql` —— sql string（required）
* `values` —— corresponding values in where clause（not required）

```JS
const result = await this.app.mysqlx.query(`SELECT id, name, age FROM test_table WHERE id >= ? AND status = ?;`, [50, 0]);
```

The above usage is recommended. In this way, the plugin will preprocess the statements, which can effectively prevent sql injection.

If you are used to splicing string, you need to use the `escape` method to escape the incoming value, which can also prevent SQL injection.

```JS
const escapedId = this.app.mysqlx.escape(id);
const escapedStatus = this.app.mysqlx.escape(status);
const result = await this.app.mysqlx.query(`SELECT id, name, age FROM test_table WHERE id >= ${escapedId} AND status = ${escapedStatus};`);
```

## Transaction

A mysql transaction is a set of continuous database operations which performed as a single unit of work. Each individual operation within the group is successful and the transaction succeeds. If one part of the transaction fails, then the entire transaction fails.

The plugin also provides **manual** and **automatic** transaction processing.

### Manual Transaction

`beginTransaction` 、 `commit` and `rollback` are used to manually execute transactions.

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

`autoTransaction` method is used to manually execute transactions. It has two parameters：`scope` and `ctx`.

* `scope` —— An asynchronous function that contains multiple CURD operations
* `ctx` —— The context object of current request, it will ensures that even in the case of a nested transaction, there is only one active transaction in a request at the same time.

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

## Build-in Function

If you need to use mysql built-in function, you'd better use the `literal` method, which will format the input function string and carry out necessary processing. The built-in function without this method will not take effect (considering the special circumstances, string like `now()` may need to be stored, so it's unreasonable to execute `now()` function). Another way to use built-in functions is to write sql strings directly.

```JS
await this.app.mysqlx.update({
  table: TABLE,
  value: {
    name: client.literal("concat('tom', ' and ', 'jerry')"), // concat string
    msg: 'now()', // doesn't use literal
  },
  where: { eq: { name: 'yohn' } },
});
const result = await client.select({
  table: TABLE,
  column: ['name', 'msg'],
  where: {
    eq: { id: 2 },
  },
});
return result;
// result
result ==> [{ name: 'tom and jerry', msg: 'now()' }]

// use sql string
await this.app.mysqlx.query(`UPDATE ${TABLE} SET name = CONCAT('tom', ' and ', 'jerry') AND msg = 'now()' WHERE name = 'yohn';`);
```

## Issue

[egg-easy-mysqlx issues](https://github.com/Lancernix/egg-easy-mysqlx/issues).

## License

[MIT](LICENSE)
