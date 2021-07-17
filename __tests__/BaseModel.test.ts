jest.mock('../src/Repository')
import BaseModel from '../src/BaseModel'
import { types } from '../src/DataTypes'
import Repository from '../src/Repository'

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
        return { id: {}, nome: {}, email: {}, active: {}, timestamp: { default: () => '123456' } }
      }
    }

    const tmp = new Tmp()
    const ret = tmp.setProperties({ id: 1, nome: 'Daniel', email: '', active: false })
    expect(tmp.id).toBe(1)
    expect(tmp.nome).toBe('Daniel')
    expect(tmp.timestamp).toBe('123456')
    expect(tmp.email).toBe('')
    expect(tmp.active).toBe(false)
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
  it('repository should returns an instance of Repository', () => {
    class Tmp extends BaseModel {
      static get database() {
        return {}
      }

      static get tableName() {
        return 'tests'
      }
    }

    expect(Tmp.repository).toEqual(new Repository())
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
    expect(Tmp.repository.createTable).toHaveBeenCalledTimes(1)
  })

  it('dropTable', () => {
    Tmp.dropTable()
    expect(Tmp.repository.dropTable).toHaveBeenCalledTimes(1)
  })

  it('create', () => {
    const obj = { id: 1, nome: 'Daniel' }
    return Tmp.create(obj)
      .then(res => {
        expect(Tmp.repository.insert).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.insert).toBeCalledWith(obj)
        expect(res).toBeInstanceOf(Tmp)
      })
  })

  it('update', () => {
    const obj = { id: 1, nome: 'Daniel' }
    return Tmp.update(obj)
      .then(res => {
        expect(Tmp.repository.update).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.update).toBeCalledWith(obj)
        expect(res).toBeInstanceOf(Tmp)
      })
  })

  describe('save', () => {
    it('without id', () => {
      const tmp = new Tmp({ nome: 'Daniel' })
      return tmp.save().then(res => {
        expect(Tmp.repository.insert).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.insert).toBeCalledWith(tmp)
        expect(Tmp.repository.update).toHaveBeenCalledTimes(0)
        expect(res).toBeInstanceOf(Tmp)
      })
    })

    it('with id', () => {
      const tmp = new Tmp({ id: 1, nome: 'Daniel' })
      return tmp.save().then(res => {
        expect(Tmp.repository.update).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.update).toBeCalledWith(tmp)
        expect(Tmp.repository.insert).toHaveBeenCalledTimes(0)
        expect(res).toBeInstanceOf(Tmp)
      })
    })
  })

  describe('destroy', () => {
    it('instance method', () => {
      const tmp = new Tmp({ id: 1, nome: 'Daniel' })
      return tmp.destroy().then(res => {
        expect(Tmp.repository.destroy).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.destroy).toBeCalledWith(1)
        expect(res).toBeTruthy()
      })
    })

    it('static method', () => {
      return Tmp.destroy(1).then(res => {
        expect(Tmp.repository.destroy).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.destroy).toBeCalledWith(1)
        expect(res).toBeTruthy()
      })
    })

    it('destroyAll', () => {
      return Tmp.destroyAll().then(res => {
        expect(Tmp.repository.destroyAll).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.destroyAll).toBeCalledWith()
        expect(res).toBeTruthy()
      })
    })
  })

  describe('find', () => {
    it('found', () => {
      return Tmp.find(1).then(res => {
        expect(Tmp.repository.find).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.find).toBeCalledWith(1)
        expect(res).toBeInstanceOf(Tmp)
      })
    })

    it('not found', () => {
      return Tmp.find(999).then(res => {
        expect(Tmp.repository.find).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.find).toBeCalledWith(999)
        expect(res).toBeNull()
      })
    })
  })

  describe('findBy', () => {
    it('found', () => {
      const where = { numero_eq: 12345, codigo_verificacao_eq: 'AXJFSD' }
      return Tmp.findBy(where).then(res => {
        expect(Tmp.repository.findBy).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.findBy).toBeCalledWith(where)
        expect(res).toBeInstanceOf(Tmp)
      })
    })

    it('not found', () => {
      const fn = jest.fn(() => Promise.resolve(null))
      Tmp.repository.findBy = fn
      const where = { numero_eq: 999 }
      return Tmp.findBy(where).then(res => {
        expect(Tmp.repository.findBy).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.findBy).toBeCalledWith(where)
        expect(res).toBeNull()
      })
    })
  })

  describe('query', () => {
    it('empty options', () => {
      return Tmp.query({}).then(res => {
        expect(Tmp.repository.query).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.query).toBeCalledWith({})
        expect(res).toEqual([])
      })
    })

    it('not empty options', () => {
      const options = { columns: '*', where: { nome_cont: '%Daniel%' } }
      return Tmp.query(options).then(res => {
        expect(Tmp.repository.query).toHaveBeenCalledTimes(1)
        expect(Tmp.repository.query).toBeCalledWith(options)
        expect(res).toEqual([])
      })
    })
  })
})
