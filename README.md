# Expo SQLite ORM

[![Build Status](https://travis-ci.org/dflourusso/expo-sqlite-orm.svg?branch=master)](https://travis-ci.org/dflourusso/expo-sqlite-orm)
<a href="https://npmcharts.com/compare/expo-sqlite-orm?minimal=true"><img src="https://img.shields.io/npm/dm/expo-sqlite-orm.svg" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/expo-sqlite-orm"><img src="https://img.shields.io/npm/v/expo-sqlite-orm.svg" alt="Version"></a>
<a href="https://www.npmjs.com/package/expo-sqlite-orm"><img src="https://img.shields.io/npm/l/expo-sqlite-orm.svg" alt="License"></a>

It is a simple ORM utility to use with expo sqlite

> Warn: it works only on iOS and Android. Web is not supported ([SEE](https://docs.expo.io/versions/latest/sdk/sqlite/))

## Install

`yarn add expo-sqlite-orm`

## Basic usage

You need to provide 3 things:

- `database`: Instance of expo SQLite or promise with that instance
- `tableName`: The name of the table
- `columnMapping`: The columns for the model and their types
  - Supported options: `type`, `primary_key`, `autoincrement`, `not_null`, `unique`, `default`

```typescript
import * as SQLite from 'expo-sqlite'
import { ColumnMapping, IStatement, Migrations, Repository, sql, types } from 'expo-sqlite-orm'
import React, { useMemo, useState } from 'react'
import { ScrollView, Text } from 'react-native'

interface Animal {
  id: number
  name: string
  color: string
  age: number
  another_uid?: number
  timestamp?: number
}

const columMapping: ColumnMapping<Animal> = {
  id: { type: types.INTEGER },
  name: { type: types.TEXT },
  color: { type: types.TEXT },
  age: { type: types.NUMERIC },
  another_uid: { type: types.INTEGER },
  timestamp: { type: types.INTEGER, default: () => Date.now() },
}

const statements: IStatement = {
  '1662689376195_create_animals': sql`
        CREATE TABLE animals (
          id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          color TEXT,
          age NUMERIC,
          another_uid TEXT UNIQUE,
          timestamp INTEGER
        );`,
}

export function CadastrosScreen() {
  const [databaseResetAt, setDatabaseResetAt] = useState<number>(0)
  const [animals, setAnimals] = useState<Animal[]>([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const database = useMemo(() => SQLite.openDatabase('dbName'), [databaseResetAt]) // After reset we need to open it again
  const migrations = useMemo(() => new Migrations(database, statements), [database])

  const animalRepository = useMemo(() => {
    return new Repository(database, 'animals', columMapping)
  }, [database])

  const onPressRunMigrations = async () => {
    await migrations.migrate()
  }

  const onPressReset = async () => {
    await migrations.reset()
    setDatabaseResetAt(Date.now())
    setAnimals([])
  }

  const onPressInsert = () => {
    animalRepository.insert({ name: 'Bob', color: 'Brown', age: 2 }).then((createdAnimal) => {
      console.log(createdAnimal)
    })
  }

  const onPressQuery = () => {
    animalRepository.query({ where: { age: { gte: 1 } } }).then((foundAnimals) => {
      setAnimals(foundAnimals)
    })
  }

  return (
    <ScrollView>
      <Text onPress={onPressRunMigrations}>Migrate</Text>
      <Text onPress={onPressReset}>Reset Database</Text>
      <Text onPress={onPressInsert}>Insert Animal</Text>
      <Text onPress={onPressQuery}>List Animals</Text>
      <Text>{JSON.stringify(animals, null, 1)}</Text>
    </ScrollView>
  )
}
```

## Database operations

### Insert a record

```typescript
const props: Animal = {
  name: 'Bob',
  color: 'Brown',
  age: 2
}

animalRepository.insert(props)
```

### Find a record

```javascript
const id = 1
animalRepository.find(id)
```

or

```javascript
animalRepository.findBy({ age: { equals: 12345 }, color: { contains: '%Brown%' } })
```

### Update a record

```javascript
const props = {
  id: 1 // required
  age: 3
}

animalRepository.update(props)
```

### Destroy a record

```javascript
const id = 1
animalRepository.destroy(id)
```

### Destroy all records

```javascript
animalRepository.destroyAll()
```

### Query

```javascript
const options = {
  columns: 'id, name',
  where: {
    age: { gt: 2, lt: 10 }
  },
  page: 2,
  limit: 30,
  order: { name: 'ASC' }
}

animalRepository.query(options)
```

**Where operations**

- equals: `=`,
- notEquals: `<>`,
- lt: `<`,
- lte: `<=`,
- gt: `>`,
- gte: `>=`,
- contains: `LIKE`

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

```typescript
myCustomMethod() {
  const sql = 'SELECT * FROM table_name WHERE status = ?'
  const params = ['active']
  return animalRepository.databaseLayer.executeSql(sql, params).then(({ rows }) => rows)
}
```

## Bulk insert or replace?

```javascript
const itens = [{id: 1, color: 'green'}, {id: 2, color: 'red'}]
animalRepository.databaseLayer.bulkInsertOrReplace(itens).then(response => {
  console.log(response)
})
```

## Migrations

### Execute the migrations

```typescript
import * as SQLite from 'expo-sqlite'
import { Migrations, sql } from 'expo-sqlite-orm'

const statements: IStatement = {
  '1662689376195_init': sql`CREATE TABLE animals (id TEXT, name TEXT);`,
  '1662689376196_add_age_column': sql`ALTER TABLE animals ADD age NUMERIC;`,
  '1662689376197_add_color_column': sql`ALTER TABLE animals ADD color TEXT;`
}

const database = SQLite.openDatabase('dbName')
const migrations = new Migrations(databaseInstance, statements)
await migrations.migrate()
```

### Reset the database

```typescript
const migrations = new Migrations(databaseInstance, statements)
await migrations.reset() // Make sure to open the database again after reset it
```

# TODO

- [x] Add basic typescript support
- [x] Make it easier to use with react-hooks
- [x] Complete typescript autocomplete for where queries
- [x] Add migrations feature
- [ ] Improve migrations with CLI and better examples
- [ ] Fix some typecheckings and remove ts-igonre
- [ ] Allow OR statement

## Changelog

- **1.5.0** - Return unlimited rows if `page` is not specified in the `query` params
- **1.6.0** - Make `autoincrement` property to be optional
- **2.0.0** - BREAKING CHANGE
  - Add typescript support
  - Remove BaseModel in favor of Repository (Easier to use with react-hooks)
  - Add migrations support

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
