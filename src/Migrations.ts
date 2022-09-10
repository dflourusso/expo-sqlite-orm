import { WebSQLDatabase } from 'expo-sqlite'
import { columnTypes } from './DataTypes'
import QueryBuilder from './query_builder'
import { Repository } from './Repository'
import { ColumnMapping } from './types'

// Should be the timestamp + name
type TStatementName = `${number}_${string}`

interface IMigration {
  name: TStatementName
}

// Install the extension thebearingedge.vscode-sql-lit
const lit = (s: TemplateStringsArray, ...args: any[]) => s.map((ss, i) => `${ss}${args[i] || ''}`).join('')
export const sql = lit
export type IStatement = Record<TStatementName, string>
interface IBulkSqlArgs {
  sqls: string[]
  params: any[]
}

const TABLE_NAME = '_migrations'

const columnMapping: ColumnMapping<IMigration> = {
  name: { type: columnTypes.TEXT },
}

export class Migrations {
  private database: WebSQLDatabase
  private statements: IStatement
  public readonly repository: Repository<IMigration>

  constructor(database: WebSQLDatabase, statements: IStatement) {
    this.database = database
    this.statements = statements
    this.repository = new Repository(database, TABLE_NAME, columnMapping)
  }

  async migrate() {
    await this.setupMigrationsTable()
    const { sqls, params } = this.statementsExecutionAdapter(await this.getPendingStatements())

    return this.repository.databaseLayer.executeBulkSql(sqls, params)
  }

  async reset() {
    await this.database.closeAsync()
    await this.database.deleteAsync()
  }

  private async setupMigrationsTable() {
    const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (name TEXT NOT NULL)`
    await this.repository.databaseLayer.executeSql(sql).then(() => true)
  }

  private getExecutedMigrationNames(): Promise<TStatementName[]> {
    return this.repository.query({
      order: { name: 'DESC' },
    }).then(migrations => migrations.map(migration => migration.name))
  }

  private async getPendingStatements(): Promise<IStatement> {
    const executedMigrationNames = await this.getExecutedMigrationNames()
    return Object.keys(this.statements).sort().reduce((statements, name: TStatementName) => {
      if (executedMigrationNames.includes(name)) return statements
      return {
        ...statements,
        [name]: this.statements[name]
      }
    }, {})
  }

  private statementsExecutionAdapter(statements: IStatement): IBulkSqlArgs {
    return Object.entries(statements).reduce((accumulator, [name, sql]: [TStatementName, string]) => {
      return {
        sqls: [
          ...accumulator.sqls,
          sql,
          QueryBuilder.insert<IMigration>(TABLE_NAME, { name })
        ],
        params: [
          ...accumulator.params,
          [],
          [name]
        ]
      }
    }, { sqls: [], params: [] } as IBulkSqlArgs)
  }
}
