# Expo SQLite ORM

[![Build Status](https://travis-ci.org/dflourusso/expo-sqlite-orm.svg?branch=master)](https://travis-ci.org/dflourusso/expo-sqlite-orm)
<a href="https://npmcharts.com/compare/expo-sqlite-orm?minimal=true"><img src="https://img.shields.io/npm/dm/expo-sqlite-orm.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/expo-sqlite-orm"><img src="https://img.shields.io/npm/v/expo-sqlite-orm.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/expo-sqlite-orm"><img src="https://img.shields.io/npm/l/expo-sqlite-orm.svg" alt="License"></a>

It is a simple ORM utility to use with expo sqlite

## Install

`yarn add expo-sqlite-orm`

## Creating a model

You need to provide 3 things:

- `database`: Instance of expo SQLite or promise with that instance
- `tableName`: The name of the table
- `columnMapping`: The columns for the model and their types

```javascript
import { SQLite } from 'expo'
import { BaseModel, types } from 'expo-sqlite-orm'

export default class Animal extends BaseModel {
  constructor(obj) {
    super(obj)
  }

  static get database() {
    return Promise.resolve(SQLite.openDatabase('database.db'))
  }

  static get tableName() {
    return 'animals'
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER, primary_key: true }, // For while only supports id as primary key
      name: { type: types.TEXT },
      color: { type: types.TEXT },
      age: { type: types.NUMERIC }
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

- eq: '=',
- neq: '<>',
- lt: '<',
- lteq: '<=',
- gt: '>',
- gteq: '>=',
- cont: 'LIKE'

## Data types

- INTEGER
- FLOAT
- TEXT
- NUMERIC
- DATE
- DATETIME
- BOOLEAN
- JSON
