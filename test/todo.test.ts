import test from 'ava'

import { todo } from 'index.js'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
