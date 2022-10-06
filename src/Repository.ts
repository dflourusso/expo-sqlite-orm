import { DatabaseLayer } from './DatabaseLayer'
import DataTypes from './DataTypes'
import { ColumnMapping, ColumnOptions, IQueryOptions } from './types'

export class Repository<T = Record<string, any> | { id: any }> {
  private columnMapping: Record<keyof T, ColumnOptions>
  private tableName: string
  public readonly databaseLayer: DatabaseLayer<T>

  constructor(databaseName: string, tableName: string, columnMapping: ColumnMapping<T>) {
    this.columnMapping = columnMapping
    this.tableName = tableName
    this.databaseLayer = new DatabaseLayer(databaseName, tableName)
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

  query(options: IQueryOptions<T> = {}): Promise<T[]> {
    return this.databaseLayer.query(options).then(res => res.map((p: any) => DataTypes.toModelValue(this.columnMapping, p)))
  }

  private _sanitize(obj: Partial<T>) {
    const allowedKeys = Object.keys(this.columnMapping) as (keyof T)[]

    return Object.keys(obj).reduce((ret, key: any) => {
      return allowedKeys.includes(key) ? { ...ret, [key]: obj[key] } : ret
    }, {} as T)
  }
}
