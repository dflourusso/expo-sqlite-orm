export type TDataType = 'INTEGER' | 'FLOAT' | 'TEXT' | 'NUMERIC' | 'DATE' | 'DATETIME' | 'BOOLEAN' | 'JSON'

export const types: Record<TDataType, TDataType> = {
  INTEGER: 'INTEGER',
  FLOAT: 'FLOAT',
  TEXT: 'TEXT',
  NUMERIC: 'NUMERIC',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON'
}

export interface ColumnOptions {
  type: TDataType
  primary_key?: boolean,
  autoincrement?: boolean
  not_null?: boolean
  unique?: boolean
  default?: () => unknown
}


function toDatabaseValue<T extends {}>(columnMapping: Record<keyof T, ColumnOptions>, resource: T) {
  return Object.entries(resource).reduce((o, p) => {
    o[p[0]] = propertyToDatabaseValue(columnMapping[p[0]].type, p[1])
    return o
  }, {})
}

function propertyToDatabaseValue(type: TDataType, value: any) {
  switch (type) {
    case types.JSON:
      return JSON.stringify(value)
    case types.BOOLEAN:
      return value ? 1 : 0
    default:
      return value
  }
}

function toModelValue<T extends {}>(columnMapping: Record<keyof T, ColumnOptions>, obj: any): T {
  return Object.entries(columnMapping).reduce((o, p) => {
    if (obj.hasOwnProperty(p[0])) {
      // @ts-ignore
      o[p[0]] = propertyToModelValue(p[1].type, obj[p[0]])
    }
    return o
  }, <T>{})
}

function propertyToModelValue(type: TDataType, value: any) {
  switch (type) {
    case types.JSON:
      return JSON.parse(value || null)
    case types.BOOLEAN:
      return Boolean(value)
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
