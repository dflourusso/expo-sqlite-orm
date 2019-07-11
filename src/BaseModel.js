import Repository from './Repository'

const isFunction = p =>
  Object.prototype.toString.call(p) === '[object Function]'

export default class BaseModel {
  constructor(obj = {}) {
    this.setProperties(obj)
  }

  setProperties(props) {
    const cm = this.constructor.columnMapping
    Object.keys(cm).forEach(k => {
      if (props[k] !== undefined) {
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

  static get repository() {
    return new Repository(this.database, this.tableName, this.columnMapping)
  }

  static get tableName() {
    throw new Error('tableName não definido')
  }

  static get columnMapping() {
    return {}
  }

  static createTable() {
    return this.repository.createTable()
  }

  static dropTable() {
    return this.repository.dropTable()
  }

  static create(obj) {
    return this.repository.insert(obj).then(res => new this(res))
  }

  static update(obj) {
    return this.repository.update(obj).then(res => new this(res))
  }

  save() {
    if (this.id) {
      return this.constructor.repository
        .update(this)
        .then(res => this.setProperties(res))
    } else {
      return this.constructor.repository
        .insert(this)
        .then(res => this.setProperties(res))
    }
  }

  destroy() {
    return this.constructor.repository.destroy(this.id)
  }

  static destroy(id) {
    return this.repository.destroy(id)
  }

  static destroyAll() {
    return this.repository.destroyAll()
  }

  static find(id) {
    return this.repository.find(id).then(res => (res ? new this(res) : res))
  }

  static findBy(where) {
    return this.repository
      .findBy(where)
      .then(res => (res ? new this(res) : res))
  }

  /**
   * @param {columns: '*', page: 1, limit: 30, where: {}, order: 'id DESC'} options
   */
  static query(options) {
    return this.repository.query(options)
  }
}
