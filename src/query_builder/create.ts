// Creates the "INSERT" sql statement
export function insert<T>(tableName: string, object: T) {
  const keys = Object.keys(object)
  const columns = keys.join(', ')
  const values = keys.map(() => '?').join(', ')

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
}

export function insertOrReplace<T>(tableName: string, object: T) {
  return insert(tableName, object).replace('INSERT INTO', 'INSERT OR REPLACE INTO')
}

export default { insert, insertOrReplace }
