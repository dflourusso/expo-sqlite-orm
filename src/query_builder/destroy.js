// Creates the "DELETE" sql statement
export function destroy(tableName) {
  return `DELETE FROM ${tableName} WHERE id = ?;`
}

// Creates the "DELETE ALL" sql statement
export function destroyAll(tableName) {
  return `DELETE FROM ${tableName};`
}

export default { destroy, destroyAll }
