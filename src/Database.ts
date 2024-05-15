import * as SQLite from 'expo-sqlite/legacy'
import { SQLTransactionCallback, SQLTransactionErrorCallback, SQLiteDatabase } from 'expo-sqlite/legacy'

export class Database {
  private databaseName: string
  private database: SQLiteDatabase
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

  async close(): Promise<void> {
    if (!this.database) return
    await this.database.closeAsync()
    this.database = undefined
  }

  async reset(): Promise<void> {
    this.openDatabase()
    await this.database.closeAsync()
    await this.database.deleteAsync()
    this.database = undefined
  }
}
