jest.mock('../src/query_builder', () => {
  const methods = [
    'insert',
    'find',
    'query',
    'update',
    'destroy',
    'destroyAll',
    'createTable',
    'dropTable'
  ]
  return methods.reduce((o, p) => {
    o[p] = jest.fn(() => 'query')
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
  it('call execute with the correct params', done => {
    const sql = 'select * from tests where id = ?'
    const params = [1]
    databaseLayer.executeSql(sql, params)

    setTimeout(() => {
      expect(executeSql).toHaveBeenCalledTimes(1)
      expect(executeSql).toHaveBeenCalledWith(
        sql,
        params,
        expect.any(Function),
        expect.any(Function)
      )
      done()
    })
  })

  it('promise returns the expected values', done => {
    const ret = databaseLayer.executeSql()

    expect(ret).toBeInstanceOf(Promise)
    ret
      .then(res => {
        expect(res.rows).toEqual([])
        expect(res.insertId).toBeNull()
        done()
      })
      .catch(done)
  })

  it('promise returns insertId if is an insert operation', done => {
    const ret = databaseLayer.executeSql('INSERT INTO TEST (test) VALUES (1)')

    expect(ret).toBeInstanceOf(Promise)
    ret
      .then(res => {
        expect(res.rows).toEqual([])
        expect(res.insertId).toBe(1)
        done()
      })
      .catch(done)
  })
})

describe('run statements', () => {
  const qbMockReturns = 'query'
  const databaseLayer = new DatabaseLayer(database, tableName, columnMapping)
  const fn = jest.fn(() => Promise.resolve({ rows: [], insertId: null }))
  databaseLayer.executeSql = fn
  beforeEach(jest.clearAllMocks)

  it('create table', () => {
    const response = databaseLayer.createTable()
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

  it('insert', done => {
    const insertFn = jest.fn(() =>
      Promise.resolve({
        rows: [{ id: 1, teste3: '{"prop":123}' }],
        insertId: 1
      })
    )
    databaseLayer.executeSql = insertFn
    const resource = new ModelExample({
      teste1: 'teste',
      teste2: 2,
      teste3: { prop: 123 }
    })
    const response = databaseLayer.insert(resource)
    expect(Qb.insert).toBeCalledWith(tableName, resource)
    expect(response).toBeInstanceOf(Promise)
    expect(insertFn).toBeCalledWith(
      qbMockReturns,
      Object.values({ ...resource, teste3: '{"prop":123}' })
    )
    response
      .then(res => {
        expect(res).toEqual({ id: 1, teste3: { prop: 123 } })
        done()
      })
      .catch(done)
  })

  it('update', done => {
    const updateFn = jest.fn(() => Promise.resolve())
    databaseLayer.executeSql = updateFn
    const resource = new ModelExample({
      id: 1,
      teste1: 'teste',
      teste2: 2,
      teste3: { prop: 123 }
    })
    const response = databaseLayer.update(resource)
    expect(Qb.update).toBeCalledWith(tableName, resource)
    expect(response).toBeInstanceOf(Promise)
    expect(updateFn).toBeCalledWith(qbMockReturns, [
      'teste',
      2,
      '{"prop":123}',
      1
    ])
    done()
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

  it('find', done => {
    const fn = jest.fn(() =>
      Promise.resolve({
        rows: [{ id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' }]
      })
    )
    databaseLayer.executeSql = fn
    const response = databaseLayer.find(1)
    expect(Qb.find).toBeCalledWith(tableName)
    expect(fn).toBeCalledWith(qbMockReturns, [1])
    expect(response).toBeInstanceOf(Promise)
    response
      .then(res => {
        expect(res).toEqual({
          id: 1,
          teste1: 'Daniel',
          teste2: 3.5,
          teste3: { prop: 123 }
        })
        done()
      })
      .catch(done)
  })

  it('find not found', done => {
    const fn = jest.fn(() =>
      Promise.resolve({
        rows: []
      })
    )
    databaseLayer.executeSql = fn
    const response = databaseLayer.find(1)
    expect(Qb.find).toBeCalledWith(tableName)
    expect(fn).toBeCalledWith(qbMockReturns, [1])
    expect(response).toBeInstanceOf(Promise)
    response
      .then(res => {
        expect(res).toBeNull()
        done()
      })
      .catch(done)
  })

  describe('findBy', () => {
    it('with correct params returns first element found', done => {
      const fn = jest.fn(() =>
        Promise.resolve({
          rows: [
            { id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' }
          ]
        })
      )
      databaseLayer.executeSql = fn
      const where = { teste2_eq: 3.5 }
      const response = databaseLayer.findBy(where)
      expect(Qb.query).toBeCalledWith(tableName, { where, limit: 1 })
      expect(fn).toBeCalledWith(qbMockReturns, Object.values(where))
      expect(response).toBeInstanceOf(Promise)
      response
        .then(res => {
          expect(res).toEqual({
            id: 1,
            teste1: 'Daniel',
            teste2: 3.5,
            teste3: { prop: 123 }
          })
          done()
        })
        .catch(done)
    })

    it('without params returns the first row found', done => {
      const fn = jest.fn(() =>
        Promise.resolve({
          rows: [
            { id: 1, teste1: 'Daniel', teste2: 3.5, teste3: '{"prop":123}' }
          ]
        })
      )
      databaseLayer.executeSql = fn
      const response = databaseLayer.findBy()
      expect(Qb.query).toBeCalledWith(tableName, { where: {}, limit: 1 })
      expect(fn).toBeCalledWith(qbMockReturns, [])
      expect(response).toBeInstanceOf(Promise)
      response
        .then(res => {
          expect(res).toEqual({
            id: 1,
            teste1: 'Daniel',
            teste2: 3.5,
            teste3: { prop: 123 }
          })
          done()
        })
        .catch(done)
    })

    it('not found should return null', done => {
      const fn = jest.fn(() => Promise.resolve({ rows: [] }))
      databaseLayer.executeSql = fn
      const where = { teste2_eq: 3.5 }
      const response = databaseLayer.findBy(where)
      expect(Qb.query).toBeCalledWith(tableName, { where, limit: 1 })
      expect(fn).toBeCalledWith(qbMockReturns, Object.values(where))
      expect(response).toBeInstanceOf(Promise)
      response
        .then(res => {
          expect(res).toBeNull()
          done()
        })
        .catch(done)
    })
  })

  it('query', done => {
    const fn = jest.fn(() =>
      Promise.resolve({
        rows: [{ id: 1, teste3: '{"prop":123}' }]
      })
    )
    databaseLayer.executeSql = fn
    const options = { columns: 'id, teste3', where: { id_eq: 1 } }
    const params = Object.values(options.where)
    const response = databaseLayer.query(options)
    expect(Qb.query).toBeCalledWith(tableName, options)
    expect(fn).toBeCalledWith(qbMockReturns, params)
    expect(response).toBeInstanceOf(Promise)
    response
      .then(res => {
        expect(res).toEqual([
          {
            id: 1,
            teste3: { prop: 123 }
          }
        ])
        done()
      })
      .catch(done)
  })

  it('query with empty options', done => {
    const fn = jest.fn(() =>
      Promise.resolve({
        rows: [{ id: 1, teste3: '{"prop":123}' }]
      })
    )
    databaseLayer.executeSql = fn
    const response = databaseLayer.query()
    expect(Qb.query).toBeCalledWith(tableName, {})
    expect(fn).toBeCalledWith(qbMockReturns, [])
    expect(response).toBeInstanceOf(Promise)
    response
      .then(res => {
        expect(res).toEqual([
          {
            id: 1,
            teste3: { prop: 123 }
          }
        ])
        done()
      })
      .catch(done)
  })

  it('sanitize', () => {
    const obj = {
      id: 1,
      teste1: 'Daniel',
      teste2: 3.5,
      teste3: { prop: 123 },
      abacaxi: 'amarelo'
    }
    const expected = {
      id: 1,
      teste1: 'Daniel',
      teste2: 3.5,
      teste3: { prop: 123 }
    }
    const response = databaseLayer._sanitize(obj)
    expect(response).toEqual(expected)
  })
})

class ModelExample {
  constructor(obj) {
    Object.keys(this.constructor.columnMapping).forEach(k => {
      this[k] = obj[k] || null
    })
  }

  static get columnMapping() {
    return {
      id: { type: types.INTEGER },
      teste1: { type: types.TEXT },
      teste2: { type: types.FLOAT },
      teste3: { type: types.JSON }
    }
  }
}
