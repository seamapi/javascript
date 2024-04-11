import type { Builder, Command, Describe } from 'landlubber'

import {
  isSeamActionAttemptFailedError,
  isSeamActionAttemptTimeoutError,
  type LocksUnlockDoorResponse,
} from 'seam'

import type { Handler } from './index.js'

interface Options {
  deviceId: string
}

export const command: Command = 'unlock deviceId'

export const describe: Describe = 'Unlock a door'

export const builder: Builder = {
  deviceId: {
    type: 'string',
    describe: 'Device id of lock to unlock',
  },
}

export const handler: Handler<Options> = async ({ deviceId, seam, logger }) => {
  const device = await seam.devices.get({ device_id: deviceId })

  if (device.can_remotely_unlock == null) {
    throw new Error('This device does not support remote unlocking')
  }

  if (!device.can_remotely_unlock) {
    throw new Error('This device cannot be unlocked at this time')
  }

  try {
    const actionAttempt = await seam.locks.unlockDoor(
      {
        device_id: deviceId,
      },
      { waitForActionAttempt: true },
    )
    logger.info({ actionAttempt }, 'unlocked')
  } catch (err: unknown) {
    if (isSeamActionAttemptFailedError<UnlockDoorActionAttempt>(err)) {
      logger.info({ err }, 'Could not unlock the door')
      return
    }

    if (isSeamActionAttemptTimeoutError<UnlockDoorActionAttempt>(err)) {
      logger.info({ err }, 'Door took too long to unlock')
      return
    }

    throw err
  }
}

// TODO: import type { UnlockDoorActionAttempt } from 'seam'
type UnlockDoorActionAttempt = LocksUnlockDoorResponse['action_attempt']
