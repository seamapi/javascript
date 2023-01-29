import test from 'ava'

import { todo } from './todo.js'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
