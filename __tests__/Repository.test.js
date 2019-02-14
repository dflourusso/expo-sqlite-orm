jest.mock('../src/DatabaseLayer')
import Repository from '../src/Repository'
import DataTypes, { types } from '../src/DataTypes'
import DatabaseLayer from '../src/DatabaseLayer'

const columnMapping = {
  id: { type: types.INTEGER, primary_key: true },
  name: { type: types.TEXT }
}

describe('constructor', () => {
  it('should not set props', () => {
    const repository = new Repository('databaseInstance', 'test', columnMapping)
    expect(repository.columnMapping).toEqual(columnMapping)
    expect(repository.databaseLayer).toEqual(new DatabaseLayer())
    expect(DatabaseLayer.prototype.constructor).toHaveBeenCalledWith('databaseInstance', 'test')
  })
})


describe('actions', () => {
  let repository
  beforeEach(() => {
    repository = new Repository('databaseInstance', 'test', columnMapping)
    jest.clearAllMocks()
  })

  it('createTable', () => {
    repository.createTable()
    expect(repository.databaseLayer.createTable).toHaveBeenCalledTimes(1)
    expect(repository.databaseLayer.createTable).toBeCalledWith(columnMapping)
  })

  it('dropTable', () => {
    repository.dropTable()
    expect(repository.databaseLayer.dropTable).toHaveBeenCalledTimes(1)
  })

  it('insert', () => {
    const obj = { id: 1, name: 'Daniel', email: 'test@test.com', other: { p1: 'asd' } }
    const objSanitized = { id: 1, name: 'Daniel', other: JSON.stringify({ p1: 'asd' }) }
    jest.spyOn(DataTypes, 'toDatabaseValue').mockImplementationOnce(jest.fn(() => objSanitized))
    jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((p) => p))
    return repository.insert(obj).then(() => {
      expect(repository.databaseLayer.insert).toHaveBeenCalledTimes(1)
      expect(repository.databaseLayer.insert).toBeCalledWith(objSanitized)
      expect(DataTypes.toModelValue).toBeCalledWith(columnMapping, objSanitized)
    })
  })

  it('update', () => {
    const obj = { id: 1, name: 'Daniel', email: 'test@test.com' }
    const objSanitized = { id: 1, name: 'Daniel' }
    jest.spyOn(DataTypes, 'toDatabaseValue').mockImplementationOnce(jest.fn(() => objSanitized))
    repository.update(obj)
    expect(repository.databaseLayer.update).toHaveBeenCalledTimes(1)
    expect(repository.databaseLayer.update).toBeCalledWith(objSanitized)
  })

  it('destroy', () => {
    repository.destroy(2)
    expect(repository.databaseLayer.destroy).toHaveBeenCalledTimes(1)
    expect(repository.databaseLayer.destroy).toBeCalledWith(2)
  })

  it('destroyAll', () => {
    repository.destroyAll()
    expect(repository.databaseLayer.destroyAll).toHaveBeenCalledTimes(1)
  })

  describe('find', () => {
    it('found', () => {
      jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((_, p) => p))
      return repository.find(999).then(res => {
        expect(DataTypes.toModelValue).toBeCalledWith(columnMapping, { id: 999 })
        expect(repository.databaseLayer.find).toHaveBeenCalledTimes(1)
        expect(repository.databaseLayer.find).toBeCalledWith(999)
        expect(res).toEqual({ id: 999 })
      })
    })

    it('not found', () => {
      jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((_, p) => p))
      return repository.find(1).then(res => {
        expect(DataTypes.toModelValue).not.toBeCalled()
        expect(repository.databaseLayer.find).toHaveBeenCalledTimes(1)
        expect(repository.databaseLayer.find).toBeCalledWith(1)
        expect(res).toEqual(null)
      })
    })
  })

  describe('findBy', () => {
    it('found', () => {
      jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((_, p) => p))
      return repository.findBy({ numero_eq: 999 }).then(res => {
        expect(DataTypes.toModelValue).toBeCalledWith(columnMapping, { id: 999, numero: 999 })
        expect(repository.databaseLayer.findBy).toHaveBeenCalledTimes(1)
        expect(repository.databaseLayer.findBy).toBeCalledWith({ numero_eq: 999 })
        expect(res).toEqual({ id: 999, numero: 999 })
      })
    })

    it('not found', () => {
      jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((_, p) => p))
      return repository.findBy().then(res => {
        expect(DataTypes.toModelValue).not.toBeCalled()
        expect(repository.databaseLayer.findBy).toHaveBeenCalledTimes(1)
        expect(repository.databaseLayer.findBy).toBeCalledWith({})
        expect(res).toEqual(null)
      })
    })
  })

  describe('query', () => {
    it('found', () => {
      jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((_, p) => p))
      const options = { where: { status_eq: 'ativo' } }
      return repository.query(options).then(res => {
        expect(DataTypes.toModelValue).toHaveBeenNthCalledWith(1, columnMapping, { id: 2 })
        expect(DataTypes.toModelValue).toHaveBeenNthCalledWith(2, columnMapping, { id: 3 })
        expect(repository.databaseLayer.query).toHaveBeenCalledTimes(1)
        expect(repository.databaseLayer.query).toBeCalledWith(options)
        expect(res).toEqual([{ id: 2 }, { id: 3 }])
      })
    })

    it('not found', () => {
      jest.spyOn(DataTypes, 'toModelValue').mockImplementationOnce(jest.fn((_, p) => p))
      return repository.query().then(res => {
        expect(DataTypes.toModelValue).not.toBeCalled()
        expect(repository.databaseLayer.query).toHaveBeenCalledTimes(1)
        expect(repository.databaseLayer.query).toBeCalledWith({})
        expect(res).toEqual([])
      })
    })

    it('sanitize', () => {
      const obj = {
        id: 1,
        name: 'Daniel',
        teste2: 3.5,
        teste3: { prop: 123 },
        abacaxi: 'amarelo'
      }
      const expected = {
        id: 1,
        name: 'Daniel'
      }
      const response = repository._sanitize(obj)
      expect(response).toEqual(expected)
    })
  })
})
