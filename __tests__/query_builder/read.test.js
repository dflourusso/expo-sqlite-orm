import qb from '../../src/query_builder'
import { propertyOperation, queryWhere } from '../../src/query_builder/read'

it('find statement', () => {
  const ret = qb.find('tests')
  const expected = 'SELECT * FROM tests WHERE id = ? LIMIT 1;'
  expect(ret).toBe(expected)
})

describe('query', () => {
  describe('auxiliar methods', () => {
    it('propertyOperation', () => {
      const tests = [
        ['criado_em', 'eq', '='],
        ['criado_em', 'neq', '<>'],
        ['criado_em', 'lt', '<'],
        ['criado_em', 'lteq', '<='],
        ['criado_em', 'gt', '>'],
        ['criado_em', 'gteq', '>='],
        ['nome', 'cont', 'LIKE']
      ]
      tests.forEach(p =>
        expect(propertyOperation(`${p[0]}_${p[1]}`)).toBe(`${p[0]} ${p[2]}`)
      )
    })

    it('propertyOperation with invalid operator', () => {
      const func = () => propertyOperation('nome_asdf')
      expect(func).toThrowError()
    })

    it('queryWhere with one param', () => {
      const options = { status_eq: 'normal' }
      const expected = 'WHERE status = ?'
      expect(queryWhere(options)).toBe(expected)
    })

    it('queryWhere with more params', () => {
      const options = {
        nome_cont: 'Daniel',
        status_eq: 'normal',
        criado_em_gt: new Date()
      }
      const expected = 'WHERE nome LIKE ? AND status = ? AND criado_em > ?'
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
      const sql = qb.query('items', {
        columns: 'id, nome, status',
        page: 3,
        limit: 40,
        where: { status_eq: 'normal', criado_em_gt: 'some date' }
      })
      const expected =
        'SELECT id, nome, status FROM items WHERE status = ? AND criado_em > ? ORDER BY id DESC LIMIT 40 OFFSET 80'
      expect(sql).toBe(expected)
    })
  })
})
