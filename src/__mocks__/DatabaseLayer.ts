export const executeBulkSql = jest.fn(async p => p)
export const executeSql = jest.fn(async p => p)
export const createTable = jest.fn(async p => p)
export const dropTable = jest.fn(async p => p)
export const insert = jest.fn(async p => p)
export const update = jest.fn(() => Promise.resolve({}))
export const destroy = jest.fn(() => Promise.resolve(true))
export const destroyAll = jest.fn(() => Promise.resolve(true))
export const find = jest.fn(id => Promise.resolve(id === 999 ? { id } : null))
export const findBy = jest.fn(({ numero_eq }) =>
  Promise.resolve(numero_eq === 999 ? { id: numero_eq, numero: numero_eq } : null)
)
export const query = jest.fn(({ where }) => Promise.resolve(where && where.status_eq === 'ativo' ? [
  { id: 2 },
  { id: 3 }
] : []))
export const _sanitize = jest.fn()

export const DatabaseLayer = jest.fn().mockImplementation(() => {
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
