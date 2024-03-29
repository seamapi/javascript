#!/usr/bin/env tsx

import { env } from 'node:process'

import landlubber, {
  type DefaultContext,
  defaultMiddleware,
  type EmptyOptions,
  type Handler as DefaultHandler,
  type MiddlewareFunction,
} from 'landlubber'

import { Seam } from 'seam'

import * as devices from './devices.js'

export type Handler<Options = EmptyOptions> = DefaultHandler<Options, Context>

type Context = DefaultContext & ClientContext

interface ClientContext {
  seam: Seam
}

const commands = [devices]

const createAppContext: MiddlewareFunction = async (argv) => {
  const apiKey = argv['api-key']
  if (typeof apiKey !== 'string') throw new Error('Missing Seam API key')
  const seam = Seam.fromApiKey(apiKey)
  argv['seam'] = seam
}

const middleware = [...defaultMiddleware, createAppContext]

await landlubber<Context>(commands, { middleware })
  .describe('api-key', 'Seam API key')
  .string('api-key')
  .default('api-key', env.SEAM_API_KEY, 'SEAM_API_KEY')
  .demandOption('api-key')
  .parse()
