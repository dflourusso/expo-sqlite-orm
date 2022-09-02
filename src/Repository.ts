import { WebSQLDatabase } from 'expo-sqlite'
import DatabaseLayer from './DatabaseLayer'
import DataTypes, { ColumnOptions } from './DataTypes'

export type ColumnMapping<T> = Record<keyof T, ColumnOptions>

export class Repository<T = Record<string, any> | { id: any }> {
  private columnMapping: Record<keyof T, ColumnOptions>
  public readonly databaseLayer: DatabaseLayer<T>

  constructor(database: WebSQLDatabase, tableName: string, columnMapping: ColumnMapping<T>) {
    this.columnMapping = columnMapping
    this.databaseLayer = new DatabaseLayer(database, tableName)
  }

  createTable() {
    return this.databaseLayer.createTable(this.columnMapping)
  }

  dropTable() {
    return this.databaseLayer.dropTable()
  }

  insert(data: Omit<T, 'id'>): Promise<T> {
    // @ts-ignore
    const obj = DataTypes.toDatabaseValue(this.columnMapping, this._sanitize(data))
    return this.databaseLayer.insert(obj).then(res => DataTypes.toModelValue(this.columnMapping, res) as T)
  }

  update(data: T): Promise<T> {
    const obj = DataTypes.toDatabaseValue(this.columnMapping, this._sanitize(data))
    return this.databaseLayer.update(obj)
  }

  destroy(id: any): Promise<boolean> {
    return this.databaseLayer.destroy(id)
  }

  destroyAll(): Promise<boolean> {
    return this.databaseLayer.destroyAll()
  }

  find(id: any): Promise<T | null> {
    return this.databaseLayer.find(id).then(res => (res ? DataTypes.toModelValue(this.columnMapping, res) as T : null))
  }

  findBy(where = {}): Promise<T | null> {
    return this.databaseLayer.findBy(where).then(res => (res ? DataTypes.toModelValue(this.columnMapping, res) as T : null))
  }

  query(options = {}): Promise<T[]> {
    return this.databaseLayer.query(options).then(res => res.map((p: any) => DataTypes.toModelValue(this.columnMapping, p)))
  }

  private _sanitize(obj: Partial<T>) {
    const allowedKeys = Object.keys(this.columnMapping) as (keyof T)[]

    return Object.keys(obj).reduce((ret, key: any) => {
      return allowedKeys.includes(key) ? { ...ret, [key]: obj[key] } : ret
    }, {} as T)
  }
}
