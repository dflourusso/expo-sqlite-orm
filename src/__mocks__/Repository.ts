export const executeBulkSql = jest.fn()
export const executeSql = jest.fn()
export const createTable = jest.fn()
export const dropTable = jest.fn()
export const insert = jest.fn(() => Promise.resolve({}))
export const update = jest.fn(() => Promise.resolve({}))
export const destroy = jest.fn(() => Promise.resolve(true))
export const destroyAll = jest.fn(() => Promise.resolve(true))
export const find = jest.fn(id => Promise.resolve(id === 999 ? null : {}))
export const findBy = jest.fn(({ numero_eq }) =>
  Promise.resolve(numero_eq === 999 ? null : {})
)
export const query = jest.fn(() => Promise.resolve([]))
export const _sanitize = jest.fn()

export default jest.fn().mockImplementation(() => {
  return {
    executeBulkSql,
    executeSql,
    createTable,
    dropTable,
    insert,
    update,
    destroy,
    destroyAll,
    find,
    findBy,
    query,
    _sanitize
  }
})
