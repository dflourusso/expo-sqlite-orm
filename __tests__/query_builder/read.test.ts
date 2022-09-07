import qb from '../../src/query_builder'
import { propertyOperation, queryWhere } from '../../src/query_builder/read'
import { IQueryOperation, IQueryWhere } from '../../src/types'

interface Animal {
  id: string
  name: string
  status: string
  created_at: string
}

it('find statement', () => {
  const ret = qb.find('tests')
  const expected = 'SELECT * FROM tests WHERE id = ? LIMIT 1;'
  expect(ret).toBe(expected)
})

describe('query', () => {
  describe('auxiliar methods', () => {
    it.each([
      ['created_at', ['equals'], 'created_at = ?'],
      ['created_at', ['notEquals'], 'created_at <> ?'],
      ['created_at', ['lt'], 'created_at < ?'],
      ['created_at', ['lte'], 'created_at <= ?'],
      ['created_at', ['gt'], 'created_at > ?'],
      ['created_at', ['gte'], 'created_at >= ?'],
      ['created_at', ['lt', 'gt'], 'created_at < ? AND created_at > ?'],
      ['name', ['contains'], 'name LIKE ?']
    ])('propertyOperation %s %s %s', (property, options, expected) => {
      expect(propertyOperation(property, options as IQueryOperation[])).toBe(expected)
    })

    it('propertyOperation with invalid operator', () => {
      const func = () => propertyOperation('name', ['asdf'] as unknown as IQueryOperation[])
      expect(func).toThrowError()
    })

    it('queryWhere with one param', () => {
      const options: IQueryWhere = { status: { equals: 'normal' } }
      const expected = 'WHERE status = ?'
      expect(queryWhere(options)).toBe(expected)
    })

    it('queryWhere with more params', () => {
      const options = {
        name: { contains: 'Daniel' },
        status: { equals: 'normal' },
        created_at: { gt: new Date() }
      }
      const expected = 'WHERE name LIKE ? AND status = ? AND created_at > ?'
      expect(queryWhere(options)).toBe(expected)
    })
  })

  describe('main method', () => {
    it('with no params', () => {
      const sql = qb.query('items')
      const expected = 'SELECT * FROM items ORDER BY id DESC'
      expect(sql).toBe(expected)
    })

    it('with page params', () => {
      const sql = qb.query('items', { page: 1 })
      const expected = 'SELECT * FROM items ORDER BY id DESC LIMIT 30 OFFSET 0'
      expect(sql).toBe(expected)
    })

    it('with all possible params', () => {
      const sql = qb.query<Animal>('items', {
        columns: ['id', 'name', 'status'],
        page: 3,
        limit: 40,
        where: { status: { equals: 'normal' }, created_at: { gt: 'some date' } }
      })
      const expected =
        'SELECT id, name, status FROM items WHERE status = ? AND created_at > ? ORDER BY id DESC LIMIT 40 OFFSET 80'
      expect(sql).toBe(expected)
    })
  })
})
