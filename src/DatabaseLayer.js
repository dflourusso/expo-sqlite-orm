import QueryBuilder from './query_builder'

export default class DatabaseLayer {
  constructor(database, tableName) {
    this.database = database
    this.tableName = tableName
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

  createTable(columnMapping) {
    const sql = QueryBuilder.createTable(this.tableName, columnMapping)
    return this.executeSql(sql).then(() => true)
  }

  dropTable() {
    const sql = QueryBuilder.dropTable(this.tableName)
    return this.executeSql(sql).then(() => true)
  }

  insert(obj) {
    const sql = QueryBuilder.insert(this.tableName, obj)
    const params = Object.values(obj)
    return this.executeSql(sql, params).then(({ insertId }) => this.find(insertId))
  }

  update(obj) {
    const sql = QueryBuilder.update(this.tableName, obj)
    const { id, ...props } = obj
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
    return this.executeSql(sql, [id]).then(({ rows }) => rows[0])
  }

  findBy(where = {}) {
    const options = { where, limit: 1 }
    const sql = QueryBuilder.query(this.tableName, options)
    const params = Object.values(options.where)
    return this.executeSql(sql, params).then(({ rows }) => rows[0])
  }

  query(options = {}) {
    const sql = QueryBuilder.query(this.tableName, options)
    const params = Object.values(options.where || {})
    return this.executeSql(sql, params).then(({ rows }) => rows)
  }
}
