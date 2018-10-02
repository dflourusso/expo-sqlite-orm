import {
  _createTableColumns,
  createTable,
  dropTable
} from '../../src/query_builder/schema'
import { types } from '../../src/DataTypes'

const columnMapping = {
  id: { type: types.INTEGER, primary_key: true },
  numero: { type: types.INTEGER, unique: true, not_null: true },
  codigo_verificacao: { type: types.TEXT },
  created_at: { type: types.DATETIME, not_null: true },
  checklist: { type: types.JSON }
}

describe('create table', () => {
  const expectedColumns =
    'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, numero INTEGER UNIQUE NOT NULL, codigo_verificacao TEXT, created_at DATETIME NOT NULL, checklist TEXT'
  it('columns string to create a table', () => {
    const ret = _createTableColumns(columnMapping)
    expect(ret).toBe(expectedColumns)
  })

  it('create table statement', () => {
    const ret = createTable('tests', columnMapping)
    const expected = `CREATE TABLE IF NOT EXISTS tests (${expectedColumns});`
    expect(ret).toBe(expected)
  })
})

describe('drop table', () => {
  it('drop table statement', () => {
    const ret = dropTable('tests')
    const expected = `DROP TABLE IF EXISTS tests;`
    expect(ret).toBe(expected)
  })
})
