jest.mock('../src/DatabaseLayer')
import { openDatabase, SQLiteDatabase } from 'expo-sqlite/legacy'
import { IStatement, Migrations, sql } from '../src/Migrations'

jest.mock('expo-sqlite/legacy')

const databasenName = 'databaseName'

const databaseInstance = {
  closeAsync: jest.fn(),
  deleteAsync: jest.fn()
} as unknown as SQLiteDatabase

const statements: IStatement = {
  '1662689376195_init': sql`CREATE TABLE animals (id TEXT, name TEXT);`,
  '1662689376197_add_color_column': sql`ALTER TABLE animals ADD color TEXT;`,
  '1662689376196_add_age_column': sql`ALTER TABLE animals ADD age NUMERIC;`,
}

describe('Migrations', () => {
  let migrations: Migrations
  beforeEach(() => {
    (openDatabase as jest.Mock).mockImplementationOnce(() => databaseInstance)
    migrations = new Migrations(databasenName, statements)
    jest.clearAllMocks()
  })

  it('should run all migrations sorted by name', async () => {
    jest.spyOn(migrations.repository.databaseLayer, 'executeSql').mockResolvedValueOnce(true)
    await migrations.migrate()
    expect(migrations.repository.databaseLayer.executeSql).toHaveBeenCalledWith(
      'CREATE TABLE IF NOT EXISTS _migrations (name TEXT NOT NULL)'
    )
    expect(migrations.repository.databaseLayer.executeBulkSql).toHaveBeenCalledWith(
      [
        sql`CREATE TABLE animals (id TEXT, name TEXT);`,
        sql`INSERT INTO _migrations (name) VALUES (?);`,
        sql`ALTER TABLE animals ADD age NUMERIC;`,
        sql`INSERT INTO _migrations (name) VALUES (?);`,
        sql`ALTER TABLE animals ADD color TEXT;`,
        sql`INSERT INTO _migrations (name) VALUES (?);`,
      ],
      [
        [],
        ["1662689376195_init"],
        [],
        ["1662689376196_add_age_column"],
        [],
        ["1662689376197_add_color_column"]
      ])
  })

  it('Should ignore already executed migrations', async () => {
    jest.spyOn(migrations.repository.databaseLayer, 'executeSql').mockResolvedValueOnce(true)
    jest.spyOn(migrations.repository, 'query').mockResolvedValueOnce([
      { name: '1662689376195_init' },
      { name: '1662689376196_add_age_column' },
    ])
    await migrations.migrate()
    expect(migrations.repository.databaseLayer.executeBulkSql).toHaveBeenCalledWith(
      [
        sql`ALTER TABLE animals ADD color TEXT;`,
        sql`INSERT INTO _migrations (name) VALUES (?);`,
      ],
      [
        [],
        ["1662689376197_add_color_column"]
      ])
  })

  it('Should reset the database', async () => {
    await migrations.reset()
    expect(databaseInstance.closeAsync).toHaveBeenCalled()
    expect(databaseInstance.deleteAsync).toHaveBeenCalled()
  })
})
