import qb from '../../src/query_builder'

describe('update', () => {
  it('update statement', () => {
    const ret = qb.update('tests', { id: 1, name: 'Daniel' })
    const expected = 'UPDATE tests SET name = ? WHERE id = ?;'
    expect(ret).toBe(expected)
  })
})
