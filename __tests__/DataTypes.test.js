import DataTypes, { types } from '../src/DataTypes'

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
      teste3: { type: types.JSON },
      teste4: { type: types.TEXT },
      teste5: { type: types.BOOLEAN }
    }
  }
}

const data = { nome: 'Daniel' }
const data2 = {
  id: 1,
  teste1: 'Asdf',
  teste2: 5.43,
  teste3: { json_key: 'json_value' },
  teste5: true
}

const resource = new ModelExample(data2)

describe('toDatabaseValue', () => {
  it('Should returns converted object to save in the database', () => {
    const parsedValue = DataTypes.toDatabaseValue(
      resource.constructor.columnMapping,
      resource
    )
    const expected = {
      ...data2,
      teste3: JSON.stringify(data2.teste3),
      teste4: null,
      teste5: 1
    }
    expect(parsedValue).toEqual(expected)
  })
})

describe('propertyToDatabaseValue', () => {
  it('Convert JSON type to string', () => {
    const parsedValue = DataTypes.propertyToDatabaseValue(types.JSON, data)
    expect(parsedValue).toBe(JSON.stringify(data))
  })
})

describe('toModelValue', () => {
  it('Should returns converted object to javascript', () => {
    const databaseValue = {
      ...data2,
      teste3: JSON.stringify(data2.teste3),
      teste5: 1,
      teste6: 'Eita'
    }
    const parsedValue = DataTypes.toModelValue(
      ModelExample.columnMapping,
      databaseValue
    )
    expect(parsedValue).toEqual(data2)
  })

  it('Should returns converted object, but only the props passed as param', () => {
    const databaseValue = {
      id: 1,
      teste1: 'Asdf'
    }
    const parsedValue = DataTypes.toModelValue(
      ModelExample.columnMapping,
      databaseValue
    )
    expect(parsedValue).toEqual({ 'id': 1, teste1: 'Asdf' })
  })
})

describe('propertyToModelValue', () => {
  it('Convert string to JSON type', () => {
    const parsedValue = DataTypes.propertyToModelValue(
      types.JSON,
      JSON.stringify(data)
    )
    expect(parsedValue).toEqual(data)
  })

  it('Convert undefined to JSON type', () => {
    const parsedValue = DataTypes.propertyToModelValue(
      types.JSON,
      undefined
    )
    expect(parsedValue).toBe(null)
  })

  it('Convert empty string to JSON type', () => {
    const parsedValue = DataTypes.propertyToModelValue(
      types.JSON,
      ''
    )
    expect(parsedValue).toBe(null)
  })
})
