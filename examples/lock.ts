import type { Builder, Command, Describe } from 'landlubber'

import {
  isSeamActionAttemptFailedError,
  isSeamActionAttemptTimeoutError,
  type LocksLockDoorResponse,
} from 'seam'

import type { Handler } from './index.js'

interface Options {
  deviceId: string
}

export const command: Command = 'lock deviceId'

export const describe: Describe = 'Lock a door'

export const builder: Builder = {
  deviceId: {
    type: 'string',
    describe: 'Device id of lock to lock',
  },
}

export const handler: Handler<Options> = async ({ deviceId, seam, logger }) => {
  const device = await seam.devices.get({ device_id: deviceId })

  if (device.can_remotely_lock == null) {
    throw new Error('This device does not support remote locking')
  }

  if (!device.can_remotely_lock) {
    throw new Error('This device cannot be locked at this time')
  }

  try {
    const actionAttempt = await seam.locks.lockDoor(
      {
        device_id: deviceId,
      },
      { waitForActionAttempt: true },
    )
    logger.info({ actionAttempt }, 'locked')
  } catch (err: unknown) {
    if (isSeamActionAttemptFailedError<LockDoorActionAttempt>(err)) {
      logger.info({ err }, 'Could not unlock the door')
      return
    }

    if (isSeamActionAttemptTimeoutError<LockDoorActionAttempt>(err)) {
      logger.info({ err }, 'Door took too long to unlock')
      return
    }

    throw err
  }
}

// TODO: import type { LockDoorActionAttempt } from 'seam'
type LockDoorActionAttempt = LocksLockDoorResponse['action_attempt']
