#!/usr/bin/env tsx

import landlubber from 'landlubber'

import * as todo from './todo.js'

const commands = [todo]

await landlubber(commands).parse()
