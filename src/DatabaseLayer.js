import DataTypes from './DataTypes'
import QueryBuilder from './query_builder'

export default class DatabaseLayer {
  constructor(database, tableName, columnMapping) {
    this.database = database
    this.tableName = tableName
    this.columnMapping = columnMapping
  }

  async executeSql(sql, params = []) {
    const database = await this.database()
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, { rows, insertId }) => {
            resolve({ rows: rows._array, insertId })
          },
          reject
        )
      })
    })
  }

  createTable() {
    const sql = QueryBuilder.createTable(this.tableName, this.columnMapping)
    return this.executeSql(sql).then(() => true)
  }

  dropTable() {
    const sql = QueryBuilder.dropTable(this.tableName)
    return this.executeSql(sql).then(() => true)
  }

  insert(_obj) {
    const obj = this._sanitize(_obj)
    const sql = QueryBuilder.insert(this.tableName, obj)
    const params = Object.values(
      DataTypes.toDatabaseValue(this.columnMapping, obj)
    )
    return this.executeSql(sql, params).then(({ insertId }) =>
      this.find(insertId)
    )
  }

  update(_obj) {
    const obj = this._sanitize(_obj)
    const sql = QueryBuilder.update(this.tableName, obj)
    const { id, ...props } = DataTypes.toDatabaseValue(this.columnMapping, obj)
    const params = Object.values(props)
    return this.executeSql(sql, [...params, id])
  }

  destroy(id) {
    const sql = QueryBuilder.destroy(this.tableName)
    return this.executeSql(sql, [id]).then(() => true)
  }

  destroyAll() {
    const sql = QueryBuilder.destroyAll(this.tableName)
    return this.executeSql(sql).then(() => true)
  }

  find(id) {
    const sql = QueryBuilder.find(this.tableName)
    return this.executeSql(sql, [id])
      .then(({ rows }) => rows[0])
      .then(
        res => (res ? DataTypes.toModelValue(this.columnMapping, res) : null)
      )
  }

  findBy(where = {}) {
    const options = { where, limit: 1 }
    const sql = QueryBuilder.query(this.tableName, options)
    const params = Object.values(options.where)
    return this.executeSql(sql, params)
      .then(({ rows }) => rows[0])
      .then(
        res => (res ? DataTypes.toModelValue(this.columnMapping, res) : null)
      )
  }

  query(options = {}) {
    const sql = QueryBuilder.query(this.tableName, options)
    const params = Object.values(options.where || {})
    return this.executeSql(sql, params)
      .then(({ rows }) => rows)
      .then(res => res.map(p => DataTypes.toModelValue(this.columnMapping, p)))
  }

  _sanitize(obj) {
    const allowedKeys = Object.keys(this.columnMapping)
    return Object.keys(obj).reduce((ret, key) => {
      return allowedKeys.includes(key) ? { ...ret, [key]: obj[key] } : ret
    }, {})
  }
}
