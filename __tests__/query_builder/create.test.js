import qb from '../../src/query_builder'

it('insert statement', () => {
  const ret = qb.insert('tests', { id: 1, name: 'Daniel' })
  const expected = `INSERT INTO tests (id, name) VALUES (?, ?);`
  expect(ret).toBe(expected)
})

it('insert or replace statement', () => {
  const ret = qb.insertOrReplace('tests', { id: 1, name: 'Daniel' })
  const expected = `INSERT OR REPLACE INTO tests (id, name) VALUES (?, ?);`
  expect(ret).toBe(expected)
})
