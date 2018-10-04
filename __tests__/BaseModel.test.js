jest.mock('../src/DatabaseLayer')
import BaseModel from '../src/BaseModel'
import { types } from '../src/DataTypes'
import DatabaseLayer from '../src/DatabaseLayer'

describe('setProperties', () => {
  it('should not set with empty columnMapping', () => {
    const bm = new BaseModel()
    bm.setProperties({ id: 1, nome: 'Daniel' })
    expect(bm.id).toBeUndefined()
    expect(bm.nome).toBeUndefined()
  })

  it('should set the properties', () => {
    class Tmp extends BaseModel {
      static get columnMapping() {
        return { id: {}, nome: {}, timestamp: { default: () => '123456' } }
      }
    }
    const tmp = new Tmp()
    const ret = tmp.setProperties({ id: 1, nome: 'Daniel' })
    expect(tmp.id).toBe(1)
    expect(tmp.nome).toBe('Daniel')
    expect(tmp.timestamp).toBe('123456')
    expect(ret).toBeInstanceOf(Tmp)
  })

  it('should set the properties in the constructor', () => {
    class Tmp extends BaseModel {
      static get columnMapping() {
        return { id: {}, nome: {} }
      }
    }
    const tmp = new Tmp({ id: 1, nome: 'Daniel' })
    expect(tmp.id).toBe(1)
    expect(tmp.nome).toBe('Daniel')
  })
})

describe('getters', () => {
  it('database should thows an error', () => {
    expect(() => BaseModel.database).toThrow('Database não definida')
  })

  it('tableName should thows an error', () => {
    expect(() => BaseModel.tableName).toThrow('tableName não definido')
  })

  it('columnMapping should returns an empty object', () => {
    expect(BaseModel.columnMapping).toEqual({})
  })
  it('databaseLayer should returns an instance of DatabaseLayer', () => {
    class Tmp extends BaseModel {
      static get database() {
        return {}
      }

      static get tableName() {
        return 'tests'
      }
    }

    expect(Tmp.databaseLayer).toEqual(new DatabaseLayer())
  })
})

describe('actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  class Tmp extends BaseModel {
    static get database() {
      return {}
    }

    static get tableName() {
      return 'tests'
    }
    static get columnMapping() {
      return {
        id: { type: types.INTEGER },
        nome: { type: types.TEXT }
      }
    }
  }

  it('createTable', () => {
    Tmp.createTable()
    expect(Tmp.databaseLayer.createTable).toHaveBeenCalledTimes(1)
  })

  it('dropTable', () => {
    Tmp.dropTable()
    expect(Tmp.databaseLayer.dropTable).toHaveBeenCalledTimes(1)
  })

  it('create', done => {
    const obj = { id: 1, nome: 'Daniel' }
    Tmp.create(obj)
      .then(res => {
        expect(Tmp.databaseLayer.insert).toHaveBeenCalledTimes(1)
        expect(Tmp.databaseLayer.insert).toBeCalledWith(obj)
        expect(res).toBeInstanceOf(Tmp)
        done()
      })
      .catch(done)
  })

  it('update', done => {
    const obj = { id: 1, nome: 'Daniel' }
    Tmp.update(obj)
      .then(res => {
        expect(Tmp.databaseLayer.update).toHaveBeenCalledTimes(1)
        expect(Tmp.databaseLayer.update).toBeCalledWith(obj)
        expect(res).toBeInstanceOf(Tmp)
        done()
      })
      .catch(done)
  })

  describe('save', () => {
    it('without id', done => {
      const tmp = new Tmp({ nome: 'Daniel' })
      tmp
        .save()
        .then(res => {
          expect(Tmp.databaseLayer.insert).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.insert).toBeCalledWith(tmp)
          expect(Tmp.databaseLayer.update).toHaveBeenCalledTimes(0)
          expect(res).toBeInstanceOf(Tmp)
          done()
        })
        .catch(done)
    })

    it('with id', done => {
      const tmp = new Tmp({ id: 1, nome: 'Daniel' })
      tmp
        .save()
        .then(res => {
          expect(Tmp.databaseLayer.update).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.update).toBeCalledWith(tmp)
          expect(Tmp.databaseLayer.insert).toHaveBeenCalledTimes(0)
          expect(res).toBeInstanceOf(Tmp)
          done()
        })
        .catch(done)
    })
  })

  describe('destroy', () => {
    it('instance method', done => {
      const tmp = new Tmp({ id: 1, nome: 'Daniel' })
      tmp
        .destroy()
        .then(res => {
          expect(Tmp.databaseLayer.destroy).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.destroy).toBeCalledWith(1)
          expect(res).toBeTruthy()
          done()
        })
        .catch(done)
    })

    it('static method', done => {
      Tmp.destroy(1)
        .then(res => {
          expect(Tmp.databaseLayer.destroy).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.destroy).toBeCalledWith(1)
          expect(res).toBeTruthy()
          done()
        })
        .catch(done)
    })

    it('destroyAll', done => {
      Tmp.destroyAll()
        .then(res => {
          expect(Tmp.databaseLayer.destroyAll).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.destroyAll).toBeCalledWith()
          expect(res).toBeTruthy()
          done()
        })
        .catch(done)
    })
  })

  describe('find', () => {
    it('found', done => {
      Tmp.find(1)
        .then(res => {
          expect(Tmp.databaseLayer.find).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.find).toBeCalledWith(1)
          expect(res).toBeInstanceOf(Tmp)
          done()
        })
        .catch(done)
    })

    it('not found', done => {
      Tmp.find(999)
        .then(res => {
          expect(Tmp.databaseLayer.find).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.find).toBeCalledWith(999)
          expect(res).toBeNull()
          done()
        })
        .catch(done)
    })
  })

  describe('findBy', () => {
    it('found', done => {
      const where = { numero_eq: 12345, codigo_verificacao_eq: 'AXJFSD' }
      Tmp.findBy(where)
        .then(res => {
          expect(Tmp.databaseLayer.findBy).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.findBy).toBeCalledWith(where)
          expect(res).toBeInstanceOf(Tmp)
          done()
        })
        .catch(done)
    })

    it('not found', done => {
      const fn = jest.fn(() => Promise.resolve(null))
      Tmp.databaseLayer.findBy = fn
      const where = { numero_eq: 999 }
      Tmp.findBy(where)
        .then(res => {
          expect(Tmp.databaseLayer.findBy).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.findBy).toBeCalledWith(where)
          expect(res).toBeNull()
          done()
        })
        .catch(done)
    })
  })

  describe('query', () => {
    it('empty options', done => {
      Tmp.query({})
        .then(res => {
          expect(Tmp.databaseLayer.query).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.query).toBeCalledWith({})
          expect(res).toEqual([])
          done()
        })
        .catch(done)
    })

    it('not empty options', done => {
      const options = { columns: '*', where: { nome_cont: '%Daniel%' } }
      Tmp.query(options)
        .then(res => {
          expect(Tmp.databaseLayer.query).toHaveBeenCalledTimes(1)
          expect(Tmp.databaseLayer.query).toBeCalledWith(options)
          expect(res).toEqual([])
          done()
        })
        .catch(done)
    })
  })
})
