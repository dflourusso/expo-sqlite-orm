import QueryBuilder from './query_builder'

export default class DatabaseLayer {
  constructor(database, tableName) {
    this.database = database
    this.tableName = tableName
  }

  async executeBulkSql(sqls, params = []) {
    const database = await this.database()
    return new Promise((txResolve, txReject) => {
      database.transaction(tx => {
        Promise.all(sqls.map((sql, index) => {
          return new Promise((sqlResolve, sqlReject) => {
            tx.executeSql(
              sql,
              params[index],
              (_, { rows, insertId }) => {
                sqlResolve({ rows: rows._array, insertId })
              },
              (_, error) => { sqlReject(error) }
            )
          })
        })).then(txResolve).catch(txReject)
      })
    })
  }

  async executeSql(sql, params = []) {
    return this.executeBulkSql([sql], [params])
      .then(res => res[0])
      .catch(error => { throw error })
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

  bulkInsertOrReplace(objs) {
    const list = objs.reduce((accumulator, obj) => {
      const params = Object.values(obj)
      accumulator.sqls.push(QueryBuilder.insertOrReplace(this.tableName, obj))
      accumulator.params.push(params)
      return accumulator
    }, { sqls: [], params: [] })
    return this.executeBulkSql(list.sqls, list.params)
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
