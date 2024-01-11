import test from 'ava'

import { todo } from 'seam'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
