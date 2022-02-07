# egg-easy-mysqlx

一个 egg.js 的 mysql 插件，提供了常用的 CURD API 和比较完整的操作符，并增加了 TypeScript 支持，可以看作是 egg-mysql 的扩展。

## 开启插件

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

## 详细配置

配置同 egg-mysql，详细配置可移步 [egg-mysql 配置页面](https://eggjs.org/zh-cn/tutorials/mysql.html#egg-mysql)查看。

```JS
// config/config.default.js
module.exports = appInfo => {
  ...
  config.mysqlx = {
    client: {
      host: '10.188.36.4',
      port: 8002,
      user: 'tom',
      password: '123456',
      database: 'faq',
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

## 基本使用

> 若无特殊说明，以下方法的参数均为对象。

### Read

使用 `select` 方法可以进行数据查询。`select` 方法的参数包含 `table` 、 `column` 、 `where` 、 `limit` 、 `offset` 和 `order` 6 个 key。

* `table` —— 要操作的数据表名（必需）
* `column` —— 字符串数组，需要查询的列（可选）
* `where` —— 查询条件（可选）
* `limit` —— 返回结果数量（可选）
* `offset` —— 偏移量，默认为 0（可选）
* `order` —— 排序（可选）

返回结果为一个对象数组。

`where` 对象较为复杂，这里单独说明一下。`where` 是一个拥有固定 key 的对象，每一个 key 都表示 sql 语句中的一个逻辑运算符，有：

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

上述的每个 key 对应的 value 也是一个对象（`or` 除外，其对应的 value 为一个数组），该对象则为数据表中的字段和对应的值，如：

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
// 查询结果
result = [
  { id: 24, name: 'tim' },
  { id: 57, name: 'harden' },
];

const result = await this.app.mysqlx.select({
  table: 'test_table',
  // column 为空等同于不填，均表示 SELECT * FROM xxx
  column: [],
  where: {
    or: [{ eq: { name: 'harden', status: 0 }, le: { age: 30 } }, { eq: { name: 'tim' } }],
  },
});
// 查询结果
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

使用 `insert` 方法可以进行单条或者批量插入。`insert` 方法的参数包含 `table` 和 `value` 两个 key。

* `table` —— 要操作的数据表名（必需）
* `value` —— 单条插入时，是一个对象；批量插入时，则是一个对象数组（必需）

执行结果通过 `affectedRows` 进行判断。

```JS
// 单条插入
const result = await this.app.mysqlx.insert({
  table: 'test_table',
  value: {
    name: 'timo',
    age: '9',
    status: 0,
  },
});
// 插入成功
result.affectedRows ==> 1;

// 批量插入
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
// 插入成功
result.affectedRows ==> 3;
```

### Update

使用 `update` 方法可以进行数据更新。`update` 方法的参数包含 `table` 、`value` 和 `where` 三个 key。

* `table` —— 要操作的数据表名（必需）
* `value` —— 更改的数据（必需）
* `where` —— 筛选条件（可选）

执行结果同样通过 `affectedRows` 进行判断。

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

使用 `delete` 方法可以进行数据删除。`delete` 方法的参数包含 `table` 和 `where` 两个 key。

* `table` —— 要操作的数据表名（必需）
* `where` —— 筛选条件（可选）

执行结果同样通过 `affectedRows` 进行判断。

```JS
const result = await this.app.mysqlx.delete({
  table: 'test_table',
  where: {
    eq: { name: 'timo' },
  },
});

// where 不填时，会删除表中所有数据，慎用
const result = await this.app.mysqlx.delete({
  table: 'test_table',
});
```

### Get

有时可能会使用唯一键进行查询，所以也提供了 `get` 方法用于查询符合条件的**一条**数据。`get` 方法的参数类似于 `select` 方法，但没有 `offset` 和 `limit`。

返回结果为一个对象。

```JS
const result = await this.app.mysqlx.get({
  table: 'test_table',
  column: ['id', 'name'],
  where: {
    eq: { id: 2 },
  },
});
// 结果
result = { id: 2, name: 'tom' };
```

### Count

为了方便使用，也提供了 `count` 方法用于查询符合条件的数据条数。`count` 方法的参数同 `delete` 方法。

返回结果为 number。

```JS
const result = await this.app.mysqlx.count({
  table: TABLE,
  where: {
    eq: { status: 1 },
  },
});
// 结果
result ==> 13;
```

### Query

可能上述提供的方法不能完全满足实际需求，我们同样也提供了 `query` 方法用于手写 sql 语句。`query` 方法的参数**不是对象**，其有两个参数：`sql` 和 `values`。

* `sql` —— 要执行的 sql 语句（必需）
* `values` —— where 子句中对应的值（可选）

```JS
const result = await this.app.mysqlx.query(`SELECT id, name, age FROM test_table WHERE id >= ? AND status = ?;`, [50, 0]);
```

上面的用法是推荐用法，这样插件会对语句进行预处理（prepared），可以有效防止 sql 注入。

如果习惯使用拼接字符串，则需要使用 `escape` 方法对传入的值转义一下，同样也可以防止 sql 注入。

```JS
const escapedId = this.app.mysqlx.escape(id);
const escapedStatus = this.app.mysqlx.escape(status);
const result = await this.app.mysqlx.query(`SELECT id, name, age FROM test_table WHERE id >= ${escapedId} AND status = ${escapedStatus};`);
```

## 事务

mysql 一个事务将一组连续的数据库操作放在一个单一的工作单元来执行。该组内的每个单独的操作是成功，事务才能成功。如果事务中的任何操作失败，则整个事务将失败。

插件同样也提供了**手动**和**自动**两种事务处理的方式。

### 手动控制

`beginTransaction` 、 `commit` 和 `rollback` 用于手动执行事务。

```JS
// 开启事务
const tran = await this.app.mysqlx.beginTransaction();
  try {
    // 多次操作
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
    // 操作完成，提交事务
    await tran.commit();
    return true;
  } catch (error) {
    // 操作有失败，回滚事务
    await tran.rollback();
    throw error;
  }
```

### 自动事务

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
  const res1 = await tran.update({
    table: TABLE,
    value: { msg: 'update yohn message' },
    where: { eq: { id: res[0].id } },
  });
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

## 内置函数

如果需要使用 mysql 内置函数，最好通过 `literal` 方法，该方法会对输入的 function string 进行格式化并且进行必要的处理，不通过此方法的内置函数不会生效（考虑到特殊情况，可能需要存储的就是这样的字符串，那么执行这个函数就是不合理的）。另一种可以使用内置函数的方式是直接写 sql 字符串。

```JS
await this.app.mysqlx.update({
  table: TABLE,
  value: {
    name: client.literal("concat('tom', ' and ', 'jerry')"), // concat 拼接字符串
    msg: 'now()', // 这里没有使用 literal 方法，所以写入数据库中的就是 'now()'
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
// 结果
result ==> [{ name: 'tom and jerry', msg: 'now()' }]

// 直接使用 sql 字符串
await this.app.mysqlx.query(`UPDATE ${TABLE} SET name = CONCAT('tom', ' and ', 'jerry') AND msg = 'now()' WHERE name = 'yohn';`);
```

## 提问交流

请到移步至 [egg-easy-mysqlx issues](https://github.com/Lancernix/egg-easy-mysqlx/issues) 交流。

## License

[MIT](LICENSE)
