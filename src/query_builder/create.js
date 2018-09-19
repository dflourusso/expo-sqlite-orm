// Creates the "INSERT" sql statement
export function insert(tableName, object) {
  const keys = Object.keys(object)
  const columns = keys.join(', ')
  const values = keys.map(() => '?').join(', ')

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`
}

export default { insert }
