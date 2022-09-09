import create from './create'
import read from './read'
import update from './update'
import destroy from './destroy'

export default {
  ...create,
  ...read,
  ...update,
  ...destroy,
}
