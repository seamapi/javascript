import test from 'ava'

import { todo } from '@seamapi/makenew-tsmodule'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
