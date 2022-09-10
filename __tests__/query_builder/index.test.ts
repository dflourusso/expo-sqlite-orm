import qb from '../../src/query_builder'

it('find statement', () => {
  const methods = [
    'insert',
    'find',
    'query',
    'update',
    'destroy',
    'destroyAll'
  ]
  methods.forEach(p => expect(qb).toHaveProperty(p))
})
