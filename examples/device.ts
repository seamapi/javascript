import type { Builder, Command, Describe } from 'landlubber'

import type { Handler } from './index.js'

interface Options {
  deviceId: string
}

export const command: Command = 'device deviceId'

export const describe: Describe = 'Get device'

export const builder: Builder = {
  deviceId: {
    type: 'string',
    describe: 'Device id of lock to unlock',
  },
}

export const handler: Handler<Options> = async ({ deviceId, seam, logger }) => {
  const device = await seam.devices.get({ device_id: deviceId })
  logger.info({ device }, 'device')
}
