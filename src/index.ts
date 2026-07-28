import {
  SeamHttp as Seam,
  SeamHttpEndpoints as SeamEndpoints,
  type SeamHttpOptions as SeamOptions,
  SeamHttpWithoutWorkspace as SeamWithoutWorkspace,
  type SeamHttpWithoutWorkspace as SeamWithoutWorkspaceOptions,
  type SeamHttpWithoutWorkspaceOptions as SeamMultiWorkspaceOptions,
} from '@seamapi/http'

export * from '@seamapi/http'
export type { openapi } from '@seamapi/types'
export { schemas } from '@seamapi/types'
export * from '@seamapi/webhook'
export { Seam, SeamEndpoints, SeamWithoutWorkspace }
export type {
  SeamMultiWorkspaceOptions,
  SeamOptions,
  SeamWithoutWorkspaceOptions,
}
