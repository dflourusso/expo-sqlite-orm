import qb from '../../src/query_builder'

it('find statement', () => {
  const methods = [
    'insert',
    'find',
    'query',
    'update',
    'destroy',
    'destroyAll',
    'createTable',
    'dropTable'
  ]
  methods.forEach(p => expect(qb).toHaveProperty(p))
})
