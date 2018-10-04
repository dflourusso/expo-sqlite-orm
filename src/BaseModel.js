import DatabaseLayer from './DatabaseLayer'

const isFunction = p =>
  Object.prototype.toString.call(p) === '[object Function]'

export default class BaseModel {
  constructor(obj = {}) {
    this.setProperties(obj)
  }

  setProperties(props) {
    const cm = this.constructor.columnMapping
    Object.keys(cm).forEach(k => {
      if (props[k]) {
        this[k] = props[k]
      } else if (isFunction(cm[k].default)) {
        this[k] = cm[k].default()
      } else {
        this[k] = null
      }
    })
    return this
  }

  static get database() {
    throw new Error('Database não definida')
  }

  static get databaseLayer() {
    return new DatabaseLayer(this.database, this.tableName, this.columnMapping)
  }

  static get tableName() {
    throw new Error('tableName não definido')
  }

  static get columnMapping() {
    return {}
  }

  static createTable() {
    return this.databaseLayer.createTable()
  }

  static dropTable() {
    return this.databaseLayer.dropTable()
  }

  static create(obj) {
    return this.databaseLayer.insert(obj).then(res => new this(res))
  }

  static update(obj) {
    return this.databaseLayer.update(obj).then(res => new this(res))
  }

  save() {
    if (this.id) {
      return this.constructor.databaseLayer
        .update(this)
        .then(res => this.setProperties(res))
    } else {
      return this.constructor.databaseLayer
        .insert(this)
        .then(res => this.setProperties(res))
    }
  }

  destroy() {
    return this.constructor.databaseLayer.destroy(this.id)
  }

  static destroy(id) {
    return this.databaseLayer.destroy(id)
  }

  static destroyAll() {
    return this.databaseLayer.destroyAll()
  }

  static find(id) {
    return this.databaseLayer.find(id).then(res => (res ? new this(res) : res))
  }

  static findBy(where) {
    return this.databaseLayer
      .findBy(where)
      .then(res => (res ? new this(res) : res))
  }

  /**
   * @param {columns: '*', page: 1, limit: 30, where: {}, order: 'id DESC'} options
   */
  static query(options) {
    return this.databaseLayer.query(options)
  }
}
