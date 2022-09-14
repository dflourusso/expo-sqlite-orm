import * as SQLite from 'expo-sqlite'
import { SQLTransactionCallback, SQLTransactionErrorCallback, WebSQLDatabase } from 'expo-sqlite'

export class Database {
  private databaseName: string
  private database: WebSQLDatabase
  private static instances: Record<string, Database> = {}

  private constructor(databaseName: string) {
    this.databaseName = databaseName
  }

  private openDatabase() {
    if (!this.database) {
      this.database = SQLite.openDatabase(this.databaseName)
    }
  }

  static instance(databaseName: string): Database {
    if (!this.instances[databaseName]) {
      this.instances[databaseName] = new Database(databaseName)
    }

    return this.instances[databaseName]
  }

  transaction(
    callback: SQLTransactionCallback,
    errorCallback?: SQLTransactionErrorCallback,
    successCallback?: () => void
  ) {
    this.openDatabase()
    return this.database.transaction(callback, errorCallback, successCallback)
  }

  async reset(): Promise<void> {
    this.openDatabase()
    this.database.closeAsync()
    await this.database.deleteAsync()
    this.database = undefined
  }
}
