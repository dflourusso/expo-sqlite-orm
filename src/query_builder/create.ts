// Creates the "INSERT" sql statement
export function insert(tableName, object) {
  const keys = Object.keys(object)
  const columns = keys.join(', ')
  const values = keys.map(() => '?').join(', ')

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
}

export function insertOrReplace(tableName, object) {
  return insert(tableName, object).replace('INSERT INTO', 'INSERT OR REPLACE INTO')
}

export default { insert, insertOrReplace }
