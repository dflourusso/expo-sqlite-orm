import create from './create'
import read from './read'
import update from './update'
import destroy from './destroy'
import schema from './schema'

export default {
  ...create,
  ...read,
  ...update,
  ...destroy,
  ...schema
}
