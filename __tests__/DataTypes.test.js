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
      teste3: { type: types.JSON }
    }
  }
}
const data = { nome: 'Daniel' }
const data2 = {
  id: 1,
  teste1: 'Asdf',
  teste2: 5.43,
  teste3: { json_key: 'json_value' }
}

const resource = new ModelExample(data2)

describe('toDatabaseValue', () => {
  it('Should returns converted object to save in the database', () => {
    const parsedValue = DataTypes.toDatabaseValue(
      resource.constructor.columnMapping,
      resource
    )
    const expected = { ...data2, teste3: JSON.stringify(data2.teste3) }
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
  it('Should returns converted object to instantiate the model', () => {
    const databaseValue = {
      ...data2,
      teste3: JSON.stringify(data2.teste3)
    }
    const parsedValue = DataTypes.toModelValue(
      ModelExample.columnMapping,
      databaseValue
    )
    expect(parsedValue).toEqual(data2)
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
})
