# Expo SQLite ORM

[![Build Status](https://travis-ci.org/dflourusso/expo-sqlite-orm.svg?branch=master)](https://travis-ci.org/dflourusso/expo-sqlite-orm)
<a href="https://npmcharts.com/compare/expo-sqlite-orm?minimal=true"><img src="https://img.shields.io/npm/dm/expo-sqlite-orm.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/expo-sqlite-orm"><img src="https://img.shields.io/npm/v/expo-sqlite-orm.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/expo-sqlite-orm"><img src="https://img.shields.io/npm/l/expo-sqlite-orm.svg" alt="License"></a>

It is a simple ORM utility to use with expo sqlite

> Warn: it works only on iOS and Android. Web is not supported ([SEE](https://docs.expo.io/versions/latest/sdk/sqlite/))

## Install

`yarn add expo-sqlite-orm`

## Creating a model

You need to provide 3 things:

- `database`: Instance of expo SQLite or promise with that instance
- `tableName`: The name of the table
- `columnMapping`: The columns for the model and their types
  - Supported options: `type`, `primary_key`, `not_null`, `unique`, `default`

```javascript
import * as SQLite from 'expo-sqlite'
import { BaseModel, types } from 'expo-sqlite-orm'

export default class Animal extends BaseModel {
  constructor(obj) {
    super(obj)
  }

  static get database() {
    return async () => SQLite.openDatabase('database.db')
  }

  static get tableName() {
    return 'animals'
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true }, // For while only supports id as primary key
      name: { type: types.TEXT, not_null: true },
      color: { type: types.TEXT },
      age: { type: types.NUMERIC },
      another_uid: { type: types.INTEGER, unique: true },
      timestamp: { type: types.INTEGER, default: () => Date.now() }
    }
  }
}
```

## Database operations

### Drop table

`Animal.dropTable()`

### Create table

`Animal.createTable()`

### Create a record

```javascript
const props = {
  name: 'Bob',
  color: 'Brown',
  age: 2
}

const animal = new Animal(props)
animal.save()
```

or

```javascript
const props = {
  name: 'Bob',
  color: 'Brown',
  age: 2
}

Animal.create(props)
```

### Find a record

```javascript
const id = 1
Animal.find(id)
```

or

```javascript
Animal.findBy({ age_eq: 12345, color_cont: '%Brown%' })
```

### Update a record

```javascript
const id = 1
const animal = await Animal.find(id)
animal.age = 3
animal.save()
```

or

```javascript
const props = {
  id: 1 // required
  age: 3
}

Animal.update(props)
```

### Destroy a record

```javascript
const id = 1
Animal.destroy(id)
```

or

```javascript
const id = 1
const animal = await Animal.find(id)
animal.destroy()
```

### Destroy all records

```javascript
Animal.destroyAll()
```

### Query

```javascript
const options = {
  columns: 'id, name',
  where: {
    age_gt: 2
  },
  page: 2,
  limit: 30,
  order: 'name ASC'
}

Animal.query(options)
```

**Where operations**

- eq: `=`,
- neq: `<>`,
- lt: `<`,
- lteq: `<=`,
- gt: `>`,
- gteq: `>=`,
- cont: `LIKE`

## Data types

- INTEGER
- FLOAT
- TEXT
- NUMERIC
- DATE
- DATETIME
- BOOLEAN
- JSON

## How to exec a sql manually?

```javascript
import { BaseModel } from 'expo-sqlite-orm'

export default class Example extends BaseModel {
  //...another model methods...
  static myCustomMethod() {
    const sql = 'SELECT * FROM table_name WHERE status = ?'
    const params = ['active']
    return this.repository.databaseLayer.executeSql(sql, params).then(({ rows }) => rows)
  }
}
```

or

```javascript
import { SQLite } from 'expo-sqlite'
import DatabaseLayer from 'expo-sqlite-orm/src/DatabaseLayer'

const databaseLayer = new DatabaseLayer(async () => SQLite.openDatabase('database_name'))
databaseLayer.executeSql('SELECT * from table_name;').then(response => {
  console.log(response)
})
```

## Bulk insert or replace?

```javascript
import { SQLite } from 'expo-sqlite'
import DatabaseLayer from 'expo-sqlite-orm/src/DatabaseLayer'

const databaseLayer = new DatabaseLayer(async () => SQLite.openDatabase('database_name'), 'table_name')
const itens = [{id: 1, color: 'green'}, {id: 2, color: 'red'}]
databaseLayer.bulkInsertOrReplace(itens).then(response => {
  console.log(response)
})
```

## Changelog

- **1.5.0** - Return unlimited rows if `page` is not specified in the `query` params

## Development

```bash
docker-compose run --rm bump         # patch
docker-compose run --rm bump --minor # minor

git push
git push --tags
```

### Test

```bash
docker-compose run --rm app install
docker-compose run --rm app test
```

## Working examples

- [https://github.com/dflourusso/expo-sqlite-orm-example](https://github.com/dflourusso/expo-sqlite-orm-example)
- [https://snack.expo.io/@dflourusso/expo-sqlite-orm-example](https://snack.expo.io/@dflourusso/expo-sqlite-orm-example)

## Author

- [Daniel Fernando Lourusso](http://dflourusso.com.br)

## License

This project is licensed under
[MIT License](http://en.wikipedia.org/wiki/MIT_License)
