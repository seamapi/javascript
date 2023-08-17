import axios, {
  Axios,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios"
import axiosRetry from "axios-retry"
import { SeamAPIError, SeamMalformedInputError } from "../lib/api-error"
import { Routes } from "./routes"
import {
  APIResponse,
  ErroredAPIResponse,
  SuccessfulAPIResponse,
} from "../types/globals"
import { version } from "../../package.json"
import { ClientSessionsResponse } from "../types"

export interface SeamClientOptions {
  /* Seam API Key */
  apiKey?: string | null
  /* Seam Client Session Token */
  clientSessionToken?: string | null
  /**
   * Seam Endpoint to use, defaults to https://connect.getseam.com
   **/
  endpoint?: string
  /**
   * Workspace if using session authentication, defaults to SEAM_WORKSPACE_ID
   * or undefined
   **/
  workspaceId?: string
  /**
   * Extended options to pass to Axios
   */
  axiosOptions?: AxiosRequestConfig
}

export const getSeamClientOptionsWithDefaults = (
  apiKeyOrOptions?: string | SeamClientOptions
): SeamClientOptions => {
  const providedOptions =
    typeof apiKeyOrOptions === "string"
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions ?? {}

  return {
    apiKey:
      providedOptions.apiKey === null
        ? null
        : providedOptions.apiKey ??
          globalThis?.process?.env?.SEAM_API_KEY ??
          null,
    endpoint:
      providedOptions.endpoint ??
      globalThis?.process?.env?.SEAM_API_URL ??
      "https://connect.getseam.com",
    workspaceId:
      providedOptions.workspaceId ??
      globalThis?.process?.env?.SEAM_WORKSPACE_ID ??
      undefined,
    axiosOptions: providedOptions.axiosOptions ?? {},
    clientSessionToken:
      providedOptions.clientSessionToken === null
        ? null
        : providedOptions.clientSessionToken ?? null,
  }
}

export class Seam extends Routes {
  public client: AxiosInstance

  constructor(apiKeyOrOptions?: string | SeamClientOptions) {
    super()

    const { apiKey, endpoint, workspaceId, axiosOptions, clientSessionToken } =
      getSeamClientOptionsWithDefaults(apiKeyOrOptions)

    const authHeaders = getAuthHeaders({
      clientSessionToken,
      apiKey,
      workspaceId,
    })

    const headers: AxiosRequestHeaders = {
      ...axiosOptions?.headers,
      ...authHeaders,
      ...(!workspaceId ? {} : { "Seam-Workspace": workspaceId }), // only needed for session key authentication
      // 'seam-sdk-version': version // TODO: resolve error Access to XMLHttpRequest at 'http://localhost:3020/devices/list' from origin 'http://localhost:5173' has been blocked by CORS policy: Request header field seam-sdk-version is not allowed by Access-Control-Allow-Headers in preflight response.
    }
    if (typeof window === "undefined") {
      headers[
        "User-Agent"
      ] = `Javascript SDK v${version}, Node.js mode, (https://github.com/seamapi/javascript)`
    }
    this.client = axios.create({
      withCredentials: clientSessionToken ? true : false,
      ...axiosOptions,
      baseURL: endpoint,
      headers,
    })

    axiosRetry(this.client, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
    })
  }

  public async makeRequest<T>(
    request: AxiosRequestConfig
  ): Promise<SuccessfulAPIResponse<T>> {
    return makeRequest<T>(this.client, request)
  }

  static async getClientSessionToken(options: {
    publishableKey?: string
    userIdentifierKey: string
    endpoint?: string
    workspaceId?: string
    apiKey?: string
  }): Promise<APIResponse<ClientSessionsResponse>> {
    const { apiKey, endpoint, axiosOptions } =
      getSeamClientOptionsWithDefaults(options)

    if (!options.userIdentifierKey) {
      throw new Error("userIdentifierKey is required")
    }

    if (isEmail(options.userIdentifierKey)) {
      console.warn(`Using an email for the userIdentifierKey!
This is insecure because an email is common knowledge or easily guessed.
Use something with sufficient entropy known only to the owner of the client session (like a server-generated UUID).`)
    }

    const getKeyHeaders = (): AxiosRequestHeaders => {
      const { publishableKey } = options
      if (publishableKey) {
        if (!publishableKey.startsWith("seam_pk")) {
          throw new Error("Invalid publishableKey")
        }
        return { "seam-publishable-key": publishableKey }
      }

      if (apiKey) {
        if (!apiKey?.startsWith("seam_")) {
          throw new Error("Invalid apiKey")
        }
        return { "seam-api-key": apiKey }
      }

      throw new Error("Must provide a publishableKey or apiKey")
    }

    const headers = {
      ...getKeyHeaders(),
      ...axiosOptions?.headers,
    }

    const client = axios.create({
      ...axiosOptions,
      baseURL: endpoint,
      headers,
    })

    return makeRequest(client, {
      method: "PUT",
      url: "/client_sessions/create",
      data: { user_identifier_key: options.userIdentifierKey },
    })
  }
}

const isValueUsedForBearerAuthentication = (value: string) =>
  value.startsWith("seam_at") ||
  /** Exclude JWT tokens as well */
  value.startsWith("ey")

const makeRequest = async <T>(
  client: Axios,
  request: AxiosRequestConfig
): Promise<SuccessfulAPIResponse<T>> => {
  try {
    console.log(request)
    const response = await client.request(request)

    // If you have an array of strings in params, it must be joined via ","
    // If you have an object, that's invalid
    // for (const paramName in request.params) {
    //   const paramVal = request.params[param_name]

    //   if (Array.isArray(p) && typeof p[0] === "object") {
    //     throw new SeamMalformedInputError({
    //       params: "must be a string or array of strings",
    //     })
    //   }
    // }
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.data.error?.type === "invalid_input") {
        throw new SeamMalformedInputError(
          error.response.data.error.validation_errors
        )
      }

      throw new SeamAPIError(
        error.response.status,
        error.response.headers["seam-request-id"],
        (error.response.data as ErroredAPIResponse).error
      )
    }

    throw error
  }
}

const getAuthHeaders = ({
  clientSessionToken,
  apiKey,
  workspaceId,
}: {
  clientSessionToken?: string | null
  apiKey?: string | null
  workspaceId?: string
}): Record<string, string> => {
  if (apiKey && clientSessionToken) {
    throw new Error("You can't use clientSessionToken AND specify apiKey.")
  }

  if (clientSessionToken) {
    if (!clientSessionToken.startsWith("seam_cst")) {
      throw new Error("clientSessionToken must start with seam_cst")
    }
    return {
      authorization: `Bearer ${clientSessionToken}`,
      "client-session-token": clientSessionToken,
    }
  }

  if (apiKey) {
    if (apiKey.startsWith("seam_cst")) {
      throw new Error("You can't use a Client Session Token as an apiKey.")
    }
    if (!isValueUsedForBearerAuthentication(apiKey) && workspaceId)
      throw new Error(
        "You can't use API Key Authentication AND specify a workspace. Your API Key only works for the workspace it was created in. To use Session Key Authentication with multi-workspace support, contact Seam support."
      )
    return { authorization: `Bearer ${apiKey}` }
  }
  throw new Error(
    "Must provide either clientSessionToken or apiKey (API Key or Access Token with Workspace ID)."
  )
}

// SOURCE: https://stackoverflow.com/a/46181
const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
