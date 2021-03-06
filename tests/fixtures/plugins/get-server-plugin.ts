import { registerSharedTypeScriptWorker } from "ava-typescript-worker"
import { URL } from "url"
import defaultAxios from "axios"
import knex from "knex"
import path from "path"
import Seam, { AccessCode } from "../../../src"

type SeedLock = {
  connectedAccountId: string
  id1: string
  name1: string
  accessCode: AccessCode
}

export type WorkerPublishedMessage = {
  serverUrl: string
  externalDatabaseUrl: string
  seamAdminPassword: string
  seed: {
    apiKey: string
    workspaceId: string
    connectWebviewId: string
    devices: {
      schlageLock: SeedLock
      augustLock: SeedLock
    }
  }
}

const serverWorker = registerSharedTypeScriptWorker({
  filename: new URL(
    `file:${path.join(__dirname, "../", "workers", "get-server-worker.ts")}`
  ),
})

export const getServer = async (writable = false) => {
  const message = serverWorker.publish(
    writable ? "GET_WRITABLE_SERVER" : "GET_READABLE_SERVER"
  )

  const reply = await message.replies().next()
  const { serverUrl, externalDatabaseUrl, seed } = reply.value
    .data as WorkerPublishedMessage

  const db = knex(externalDatabaseUrl)

  const client = new Seam({
    apiKey: seed.apiKey,
    endpoint: serverUrl,
  })

  return {
    url: serverUrl,
    client,
    db,
    seed,
    axios: defaultAxios.create({
      baseURL: serverUrl,
      headers: {
        Authorization: `Bearer ${seed.apiKey}`,
      },
    }),
  }
}
