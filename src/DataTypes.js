export const types = {
  INTEGER: 'INTEGER',
  FLOAT: 'FLOAT',
  TEXT: 'TEXT',
  NUMERIC: 'NUMERIC',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON'
}

function toDatabaseValue(columnMapping, resource) {
  return Object.entries(columnMapping).reduce((o, p) => {
    o[p[0]] = propertyToDatabaseValue(p[1].type, resource[p[0]])
    return o
  }, {})
}

function propertyToDatabaseValue(type, value) {
  switch (type) {
    case types.JSON:
      return JSON.stringify(value)
    default:
      return value
  }
}

function toModelValue(columnMapping, obj) {
  return Object.entries(columnMapping).reduce((o, p) => {
    o[p[0]] = propertyToModelValue(p[1].type, obj[p[0]])
    return o
  }, {})
}

function propertyToModelValue(type, value) {
  switch (type) {
    case types.JSON:
      return JSON.parse(value)
    default:
      return value
  }
}

export default {
  toDatabaseValue,
  propertyToDatabaseValue,
  toModelValue,
  propertyToModelValue
}
