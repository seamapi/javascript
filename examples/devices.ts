import type { Builder, Command, Describe } from 'landlubber'

import type { Handler } from './index.js'

interface Options {}

export const command: Command = 'devices'

export const describe: Describe = 'List devices'

export const builder: Builder = {}

export const handler: Handler<Options> = async ({ seam, logger }) => {
  const devices = await seam.devices.list()
  logger.info({ devices }, 'devices')
}
