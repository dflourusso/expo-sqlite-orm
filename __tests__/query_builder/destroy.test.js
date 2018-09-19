import qb from '../../src/query_builder'

it('destroy statement', () => {
  const ret = qb.destroy('tests')
  const expected = 'DELETE FROM tests WHERE id = ?;'
  expect(ret).toBe(expected)
})

it('destroyAll statement', () => {
  const ret = qb.destroyAll('tests')
  const expected = 'DELETE FROM tests;'
  expect(ret).toBe(expected)
})
