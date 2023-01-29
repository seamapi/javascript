import type { Builder, Command, Describe, Handler } from 'landlubber'

import { todo } from 'index.js'

interface Options {
  x: string
}

export const command: Command = 'todo x'

export const describe: Describe = 'TODO'

export const builder: Builder = {
  x: {
    type: 'string',
    default: 'TODO',
    describe: 'TODO'
  }
}

export const handler: Handler<Options> = async ({ x, logger }) => {
  logger.info({ data: todo(x) }, 'TODO')
}
