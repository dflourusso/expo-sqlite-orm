jest.mock('../src/query_builder', () => {
  const methods = [
    'insert',
    'find',
    'query',
    'update',
    'insertOrReplace',
    'destroy',
    'destroyAll',
    'createTable',
    'dropTable'
  ]
  return methods.reduce((o, p) => {
    if (p === 'insertOrReplace') {
      o[p] = jest.fn((tableName, options) => `query ${tableName} (${Object.keys(options)})`)
    } else {
      o[p] = jest.fn(() => 'query')
    }
    return o
  }, {})
})

import DatabaseLayer from '../src/DatabaseLayer'
import Qb from '../src/query_builder'
import { types } from '../src/DataTypes'

const executeSql = jest.fn((sql, params, cb, errorCb) => {
  const insertId = /^INSERT/.test(sql) ? 1 : null
  cb(null, { rows: { _array: [] }, insertId })
})
const transaction = jest.fn(cb => cb({ executeSql }))
const database = jest.fn(() => Promise.resolve({ transaction }))
const tableName = 'tests'

const columnMapping = {
  id: { type: types.INTEGER },
  teste1: { type: types.TEXT },
  teste2: { type: types.FLOAT },
  teste3: { type: types.JSON }
}

describe('execute sql', () => {
  const databaseLayer = new DatabaseLayer(database, tableName, columnMapping)
  it('call execute with the correct params', () => {
    const sql = 'select * from tests where id = ?'
    const params = [1]
    return databaseLayer.executeSql(sql, params).then(() => {
      expect(executeSql).toHaveBeenCalledTimes(1)
      expect(executeSql).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function),
        expect.any(Function)
      )
    })
  })

  it('promise returns the expected values', () => {
    return databaseLayer.executeSql().then(res => {
      expect(res.rows).toEqual([])
      expect(res.insertId).toBeNull()
    })
  })

  it('promise returns insertId if is an insert operation', () => {
    return databaseLayer.executeSql('INSERT INTO TEST (test) VALUES (1)').then(res => {
      expect(res.rows).toEqual([])
      expect(res.insertId).toBe(1)
    })
  })

  it('promise rejects', () => {
    jest.spyOn(databaseLayer, 'executeBulkSql').mockImplementationOnce(jest.fn(async () => { throw 'Ops' }))
    return databaseLayer.executeSql('INSERT INTO TEST (test) VALUES (1)').catch(e => {
      expect(e).toEqual('Ops')
    })
  })
})

describe('run statements', () => {
  const qbMockReturns = 'query'
  const databaseLayer = new DatabaseLayer(database, tableName, columnMapping)
  const fn = jest.fn(() => Promise.resolve({ rows: [], insertId: null }))
  databaseLayer.executeSql = fn
  beforeEach(jest.clearAllMocks)

  it('create table', () => {
    const response = databaseLayer.createTable(columnMapping)
    expect(Qb.createTable).toBeCalledWith(tableName, columnMapping)
    expect(fn).toBeCalledWith(qbMockReturns)
    expect(response).toBeInstanceOf(Promise)
  })

  it('drop table', () => {
    const response = databaseLayer.dropTable()
    expect(Qb.dropTable).toBeCalledWith(tableName)
    expect(fn).toBeCalledWith(qbMockReturns)
    expect(response).toBeInstanceOf(Promise)
  })

  it('insert', () => {
    const insertFn = jest.fn(async () => ({ rows: [{ id: 1, teste3: '{"prop":123}' }], insertId: 1 }))
    databaseLayer.executeSql = insertFn
    const resource = { teste1: 'teste', teste2: 2, teste3: JSON.stringify({ prop: 123 }) }
    return databaseLayer.insert(resource).then(res => {
      expect(Qb.insert).toBeCalledWith(tableName, resource)
      expect(insertFn).toBeCalledWith(
        qbMockReturns,
        Object.values({ ...resource, teste3: '{"prop":123}' })
      )
      expect(res).toEqual({ id: 1, teste3: '{"prop":123}' })
    })
  })

  it('update', () => {
    const updateFn = jest.fn(() => Promise.resolve())
    databaseLayer.executeSql = updateFn
    const resource = { id: 1, teste1: 'teste', teste2: 2, teste3: '{"prop":123}' }
    return databaseLayer.update(resource).then(() => {
      expect(Qb.update).toBeCalledWith(tableName, resource)
      expect(updateFn).toBeCalledWith(qbMockReturns, ['teste', 2, '{"prop":123}', 1])
    })
  })

  it('bulkInsertOrReplace', () => {
    jest.spyOn(databaseLayer, 'executeBulkSql').mockImplementationOnce(async (p1, p2) => ([p1, p2]))
    const objs = [{ id: 1, name: 'Daniel' }, { id: 2, name: 'Fernando' }, { id: 10, name: 'Lourusso' }]
    const expectedResponse = [
      [
        'query tests (id,name)',
        'query tests (id,name)',
        'query tests (id,name)'
      ],
      [[1, 'Daniel'], [2, 'Fernando'], [10, 'Lourusso']]
    ]
    return databaseLayer.bulkInsertOrReplace(objs).then(res => {
      expect(Qb.insertOrReplace).toHaveBeenNthCalledWith(1, 'tests', { id: 1, name: 'Daniel' })
      expect(Qb.insertOrReplace).toHaveBeenNthCalledWith(2, 'tests', { id: 2, name: 'Fernando' })
      expect(Qb.insertOrReplace).toHaveBeenNthCalledWith(3, 'tests', { id: 10, name: 'Lourusso' })
      expect(res).toEqual(expectedResponse)
    })
  })

  it('destroy', () => {
    const fn = jest.fn(() => Promise.resolve())
    databaseLayer.executeSql = fn
    const response = databaseLayer.destroy(1)
    expect(Qb.destroy).toBeCalledWith(tableName)
    expect(response).toBeInstanceOf(Promise)
    expect(fn).toBeCalledWith(qbMockReturns, [1])
  })

  it('destroyAll', () => {
    const fn = jest.fn(() => Promise.resolve())
    databaseLayer.executeSql = fn
    const response = databaseLayer.destroyAll()
    expect(Qb.destroyAll).toBeCalledWith(tableName)
    expect(response).toBeInstanceOf(Promise)
    expect(fn).toBeCalledWith(qbMockReturns)
  })

  it('find', () => {
    const fn = jest.fn(async () => ({ rows: [{ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' }] }))
    databaseLayer.executeSql = fn
    return databaseLayer.find(1).then(res => {
      expect(Qb.find).toBeCalledWith(tableName)
      expect(fn).toBeCalledWith(qbMockReturns, [1])
      expect(res).toEqual({ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' })
    })
  })

  it('find not found', () => {
    const fn = jest.fn(async () => ({ rows: [] }))
    databaseLayer.executeSql = fn
    return databaseLayer.find(1).then(res => {
      expect(Qb.find).toBeCalledWith(tableName)
      expect(fn).toBeCalledWith(qbMockReturns, [1])
      expect(res).toBeUndefined()
    })
  })

  describe('findBy', () => {
    it('with correct params returns first element found', () => {
      const fn = jest.fn(async () => ({ rows: [{ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' }] }))
      databaseLayer.executeSql = fn
      const where = { teste2_eq: 3.5 }
      return databaseLayer.findBy(where).then(res => {
        expect(Qb.query).toBeCalledWith(tableName, { where, limit: 1 })
        expect(fn).toBeCalledWith(qbMockReturns, Object.values(where))
        expect(res).toEqual({ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' })
      })
    })

    it('without params returns the first row found', () => {
      const fn = jest.fn(async () => ({ rows: [{ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' }] }))
      databaseLayer.executeSql = fn
      return databaseLayer.findBy().then(res => {
        expect(Qb.query).toBeCalledWith(tableName, { where: {}, limit: 1 })
        expect(fn).toBeCalledWith(qbMockReturns, [])
        expect(res).toEqual({ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' })
      })
    })

    it('not found should return null', () => {
      const fn = jest.fn(async () => ({ rows: [] }))
      databaseLayer.executeSql = fn
      const where = { teste2_eq: 3.5 }
      return databaseLayer.findBy(where).then(res => {
        expect(Qb.query).toBeCalledWith(tableName, { where, limit: 1 })
        expect(fn).toBeCalledWith(qbMockReturns, Object.values(where))
        expect(res).toBeUndefined()
      })
    })
  })

  it('query', () => {
    const fn = jest.fn(async () => ({ rows: [{ id: 1, teste3: '{"prop":123}' }] }))
    databaseLayer.executeSql = fn
    const options = { columns: 'id, teste3', where: { id_eq: 1 } }
    const params = Object.values(options.where)
    return databaseLayer.query(options).then(res => {
      expect(Qb.query).toBeCalledWith(tableName, options)
      expect(fn).toBeCalledWith(qbMockReturns, params)
      expect(res).toEqual([{ id: 1, teste3: '{"prop":123}' }])
    })
  })

  it('query with empty options', () => {
    const fn = jest.fn(async () => ({ rows: [{ id: 1, teste3: '{"prop":123}' }] }))
    databaseLayer.executeSql = fn
    return databaseLayer.query().then(res => {
      expect(Qb.query).toBeCalledWith(tableName, {})
      expect(fn).toBeCalledWith(qbMockReturns, [])
      expect(res).toEqual([{ id: 1, teste3: '{"prop":123}' }])
    })
  })
})
