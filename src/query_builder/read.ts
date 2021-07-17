const defaultOptions = {
  columns: '*',
  page: null,
  limit: 30,
  where: {},
  order: 'id DESC'
}

// Creates the "SELECT" sql statement for find one record
export function find(tableName) {
  return `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1;`
}

/* Creates the "SELECT" sql statement for query records
 * Ex: qb.query({
 *   columns: 'id, nome, status',
 *   where: {status_eq: 'encerrado'}
 * })
 */
export function query(tableName, options = {}) {
  const { columns, page, limit, where, order } = {
    ...defaultOptions,
    ...options
  }

  const whereStatement = queryWhere(where)
  let sqlParts = [
    'SELECT',
    columns,
    'FROM',
    tableName,
    whereStatement,
    'ORDER BY',
    order
  ]

  if(page !== null) {
    sqlParts.push(...[
      'LIMIT',
      limit,
      'OFFSET',
      limit * (page - 1)
    ])
  }

  return sqlParts.filter(p => p !== '').join(' ')
}

// Convert operators to database syntax
export function propertyOperation(statement) {
  const operations = {
    eq: '=',
    neq: '<>',
    lt: '<',
    lteq: '<=',
    gt: '>',
    gteq: '>=',
    cont: 'LIKE'
  }
  const pieces = statement.split('_')
  const operation = pieces.pop()
  const property = pieces.join('_')
  if (!operations.hasOwnProperty(operation)) {
    throw new Error(
      'Operation not found, use (eq, neq, lt, lteq, gt, gteq, cont)'
    )
  }
  return `${property} ${operations[operation]}`
}

// Build where query
export function queryWhere(options) {
  const list = Object.keys(options).map(p => `${propertyOperation(p)} ?`)
  return list.length > 0 ? `WHERE ${list.join(' AND ')}` : ''
}

export default { find, query }
