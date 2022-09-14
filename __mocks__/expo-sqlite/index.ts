export const openDatabase = jest.fn(() => ({
  closeAsync: jest.fn(),
  deleteAsync: jest.fn(),
  transaction: jest.fn((cb) => cb({
    executeSql: jest.fn((sql, params, onSuccess, onError) => {
      if (sql === '') {
        onSuccess(null, { rows: { _array: [] }, insertId: null })
        return
      }
      onSuccess(null, { rows: { _array: [] }, insertId: params[0] || 1 })
    })
  }))
}))