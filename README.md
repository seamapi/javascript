# Seam JavaScript SDK

[![npm](https://img.shields.io/npm/v/seam.svg)](https://www.npmjs.com/package/seam)
[![GitHub Actions](https://github.com/seamapi/javascript/actions/workflows/check.yml/badge.svg)](https://github.com/seamapi/javascript/actions/workflows/check.yml)

JavaScript SDK for the Seam API written in TypeScript.

## Description

[Seam] makes it easy to integrate IoT devices with your applications.
This is an official SDK for the Seam API.
Please refer to the official [Seam Docs] to get started.

The SDK is fully tree-shakeable
and optimized for use in both client and server applications.

The repository does not contain the SDK code.
Instead, it builds on a core set of Seam modules:

- [@seamapi/cli]: Command line interface for interacting with the Seam API.
- [@seamapi/http]: JavaScript HTTP client for the Seam API written in TypeScript.
- [@seamapi/webhook]: Webhook SDK for the Seam API written in TypeScript.

[Seam]: https://www.seam.co/
[Seam Docs]: https://docs.seam.co/latest/
[@seamapi/cli]: https://github.com/seamapi/cli
[@seamapi/http]: https://github.com/seamapi/javascript-http
[@seamapi/webhook]: https://github.com/seamapi/javascript-webhook

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
  - [Examples](#examples)
    - [List devices](#list-devices)
    - [Unlock a door](#unlock-a-door)
  - [Authentication Methods](#authentication-methods)
    - [API Key](#api-key)
    - [Client Session Token](#client-session-token)
    - [Publishable Key](#publishable-key)
    - [Personal Access Token](#personal-access-token)
    - [Console Session Token](#console-session-token)
  - [Action Attempts](#action-attempts)
  - [Pagination](#pagination)
    - [Manually fetch pages with the nextPageCursor](#manually-fetch-pages-with-the-nextpagecursor)
    - [Resume pagination](#resume-pagination)
    - [Iterate over all pages](#iterate-over-all-pages)
    - [Iterate over all resources](#iterate-over-all-resources)
    - [Return all resources across all pages as an array](#return-all-resources-across-all-pages-as-an-array)
  - [Error Handling](#error-handling)
    - [Validation errors](#validation-errors)
  - [Requests without a Workspace in scope](#requests-without-a-workspace-in-scope)
    - [Personal Access Token](#personal-access-token-1)
    - [Console Session Token](#console-session-token-1)
  - [Advanced Usage](#advanced-usage)
    - [Additional Options](#additional-options)
    - [Setting the endpoint](#setting-the-endpoint)
    - [Setting the request timeout](#setting-the-request-timeout)
    - [Configuring the Axios Client](#configuring-the-axios-client)
    - [Using the Axios Client](#using-the-axios-client)
    - [Overriding the Client](#overriding-the-client)
    - [Alternative endpoint path interface](#alternative-endpoint-path-interface)
    - [Inspecting the Request](#inspecting-the-request)
    - [Serializing URL search params](#serializing-url-search-params)
  - [Command Line Interface](#command-line-interface)
  - [Output](#output)
  - [Pagination](#pagination-1)
  - [JSON](#json)
  - [Selecting an endpoint and a workspace](#selecting-an-endpoint-and-a-workspace)
  - [Environment variables](#environment-variables)
  - [Receiving Webhooks](#receiving-webhooks)
- [Development and Testing](#development-and-testing)
  - [Quickstart](#quickstart)
  - [Source code](#source-code)
  - [Requirements](#requirements)
  - [Publishing](#publishing)
    - [Automatic](#automatic)
    - [Manual](#manual)
- [GitHub Actions](#github-actions)
- [Contributing](#contributing)
- [License](#license)
- [Warranty](#warranty)

<!-- tocstop -->

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install seam
```

[npm]: https://www.npmjs.com/

## Usage

### Examples

> [!NOTE]
> These examples assume `SEAM_API_KEY` is set in your environment.

#### List devices

```ts
import { Seam } from 'seam'

const seam = new Seam()
const devices = await seam.devices.list()
```

#### Unlock a door

```ts
import { Seam } from 'seam'

const seam = new Seam()
const lock = await seam.locks.get({ name: 'Front Door' })
await seam.locks.unlockDoor({ device_id: lock.device_id })
```

### Authentication Methods

The SDK supports several authentication mechanisms.
Authentication may be configured by passing the corresponding
options directly to the `Seam` constructor,
or with the more ergonomic static factory methods.

> [!NOTE]
> Publishable Key authentication is not supported by the constructor
> and must be configured using `Seam.fromPublishableKey`.

#### API Key

An API key is scoped to a single workspace and should only be used on the server.
Obtain one from the Seam Console.

```ts
// Set the `SEAM_API_KEY` environment variable
const seam = new Seam()

// Pass as the first argument to the constructor
const seam = new Seam('your-api-key')

// Pass as an option to the constructor
const seam = new Seam({ apiKey: 'your-api-key' })

// Use the factory method
const seam = Seam.fromApiKey('your-api-key')
```

#### Client Session Token

A Client Session Token is scoped to a client session and should only be used on the client.

```ts
// Pass as an option to the constructor
const seam = new Seam({ clientSessionToken: 'some-client-session-token' })

// Use the factory method
const seam = Seam.fromClientSessionToken('some-client-session-token')
```

The client session token may be updated using

```ts
const seam = Seam.fromClientSessionToken('some-client-session-token')

await seam.updateClientSessionToken('some-new-client-session-token')
```

#### Publishable Key

A Publishable Key is used by the client to acquire Client Session Token for a workspace.
Obtain one from the Seam Console.

Use the async factory method to return a client authenticated with a client session token:

```ts
const seam = await Seam.fromPublishableKey(
  'your-publishable-key',
  'some-user-identifier-key',
)
```

This will get an existing client session matching the user identifier key,
or create a new empty client session.

#### Personal Access Token

A Personal Access Token is scoped to a Seam Console user.
Obtain one from the Seam Console.
A workspace ID must be provided when using this method
and all requests will be scoped to that workspace.

```ts
// Set the `SEAM_PERSONAL_ACCESS_TOKEN` and `SEAM_WORKSPACE_ID` environment variables
const seam = new Seam()

// Pass as an option to the constructor
const seam = new Seam({
  personalAccessToken: 'your-personal-access-token',
  workspaceId: 'your-workspace-id',
})

// Use the factory method
const seam = Seam.fromPersonalAccessToken(
  'some-console-session-token',
  'your-workspace-id',
)
```

#### Console Session Token

A Console Session Token is used by the Seam Console.
This authentication method is only used by internal Seam applications.
A workspace ID must be provided when using this method
and all requests will be scoped to that workspace.

```ts
// Pass as an option to the constructor
const seam = new Seam({
  consoleSessionToken: 'some-console-session-token',
  workspaceId: 'your-workspace-id',
})

// Use the factory method
const seam = Seam.fromConsoleSessionToken(
  'some-console-session-token',
  'your-workspace-id',
)
```

### Action Attempts

Some asynchronous operations, e.g., unlocking a door, return an [action attempt].
Seam tracks the progress of the requested operation and updates the action attempt
when it succeeds or fails.

To make working with action attempts more convenient for applications,
this library provides the `waitForActionAttempt` option and enables it by default.

When the `waitForActionAttempt` option is enabled, the SDK:

- Polls the action attempt up to the `timeout`
  at the `pollingInterval` (both in milliseconds).
  Polling stops as soon as the `timeout` passes,
  and every wait polls at least once,
  even when the `timeout` is shorter than the `pollingInterval`.
  The `timeout` must not be negative,
  and the `pollingInterval` must be greater than zero.
- Resolves with a fresh copy of the successful action attempt.
- Rejects with a `SeamActionAttemptFailedError` if the action attempt is unsuccessful.
- Rejects with a `SeamActionAttemptTimeoutError` if the action attempt is still pending when the `timeout` is reached.
- Both errors expose an `actionAttempt` property.

If you already have an action attempt ID
and want to wait for it to resolve, simply use

```ts
await seam.actionAttempts.get({ action_attempt_id })
```

Or, to get the current state of an action attempt by ID without waiting:

```ts
await seam.actionAttempts.get(
  { action_attempt_id },
  {
    waitForActionAttempt: false,
  },
)
```

To disable this behavior, set the default option for the client:

```ts
const seam = new Seam({
  apiKey: 'your-api-key',
  waitForActionAttempt: false,
})

await seam.locks.unlockDoor({ device_id })
```

or the behavior may be configured per-request:

```ts
await seam.locks.unlockDoor(
  { device_id },
  {
    waitForActionAttempt: false,
  },
)
```

The `pollingInterval` and `timeout` may be configured for the client or per-request.
For example:

```ts
import {
  Seam,
  isSeamActionAttemptFailedError,
  isSeamActionAttemptTimeoutError,
} from 'seam'

const seam = new Seam('your-api-key', {
  waitForActionAttempt: {
    pollingInterval: 1000,
    timeout: 5000,
  },
})

const [lock] = await seam.locks.list()

if (lock == null) throw new Error('No locks in this workspace')

try {
  await seam.locks.unlockDoor({ device_id: lock.device_id })
  console.log('Door unlocked')
} catch (err: unknown) {
  if (isSeamActionAttemptFailedError(err)) {
    console.log('Could not unlock the door')
    return
  }

  if (isSeamActionAttemptTimeoutError(err)) {
    console.log('Door took too long to unlock')
    return
  }

  throw err
}
```

[action attempt]: https://docs.seam.co/latest/core-concepts/action-attempts

### Pagination

Some Seam API endpoints that return lists of resources support pagination.
Use the `SeamPaginator` class to fetch and process resources across multiple pages.

#### Manually fetch pages with the nextPageCursor

```ts
const pages = seam.createPaginator(
  seam.devices.list({
    limit: 20,
  }),
)

const [devices, { hasNextPage, nextPageCursor }] = await pages.firstPage()

if (hasNextPage) {
  const [moreDevices] = await pages.nextPage(nextPageCursor)
}
```

#### Resume pagination

Get the first page on initial load:

```ts
const params = { limit: 20 }

const pages = seam.createPaginator(seam.devices.list(params))

const [devices, pagination] = await pages.firstPage()

localStorage.setItem('/seam/devices/list', JSON.stringify([params, pagination]))
```

Get the next page at a later time:

```ts
const [params = {}, { hasNextPage = false, nextPageCursor = null } = {}] =
  JSON.parse(localStorage.getItem('/seam/devices/list') ?? '[]')

if (hasNextPage) {
  const pages = seam.createPaginator(seam.devices.list(params))
  const [moreDevices] = await pages.nextPage(nextPageCursor)
}
```

#### Iterate over all pages

```ts
const pages = seam.createPaginator(
  seam.devices.list({
    limit: 20,
  }),
)

for await (const devices of pages) {
  console.log(`There are ${devices.length} devices on this page.`)
}
```

#### Iterate over all resources

```ts
const pages = seam.createPaginator(
  seam.devices.list({
    limit: 20,
  }),
)

for await (const device of pages.flatten()) {
  console.log(device.display_name)
}
```

#### Return all resources across all pages as an array

```ts
const pages = seam.createPaginator(
  seam.devices.list({
    limit: 20,
  }),
)

const devices = await pages.flattenToArray()
```

### Error Handling

Requests rejected by the Seam API throw a `SeamApiError` subclass
carrying the `statusCode`, the API error `code`, and the `requestId`.
The originating Axios error is retained as the standard `cause`.

#### Validation errors

When the API rejects a request because a parameter is invalid,
it throws a `SeamInvalidInputError`.

Look up the messages for a parameter you are already rendering,
for example a field in a form:

```ts
import { isSeamInvalidInputError } from 'seam'

try {
  await seam.devices.list({ device_ids: ['not-a-uuid'] })
} catch (err) {
  if (isSeamInvalidInputError(err)) {
    console.log(err.getValidationErrorMessages('device_ids'))
  }
}
```

Or read every parameter that failed validation,
for example to show a summary of what went wrong:

```ts
if (isSeamInvalidInputError(err)) {
  for (const { parameterName, errorMessages } of err.validationErrors) {
    console.log(`${parameterName}: ${errorMessages.join(', ')}`)
  }
}
```

### Requests without a Workspace in scope

Some Seam API endpoints do not require a workspace in scope.
The `SeamWithoutWorkspace` client is not bound to a specific workspace
and may use those endpoints with an appropriate authentication method.

#### Personal Access Token

A Personal Access Token is scoped to a Seam Console user.
Obtain one from the Seam Console.

```ts
// Set the `SEAM_PERSONAL_ACCESS_TOKEN` environment variable
const seam = new SeamWithoutWorkspace()

// Pass as an option to the constructor
const seam = new SeamWithoutWorkspace({
  personalAccessToken: 'your-personal-access-token',
})

// Use the factory method
const seam = SeamWithoutWorkspace.fromPersonalAccessToken(
  'some-console-session-token',
)

// List workspaces authorized for this Personal Access Token
const workspaces = await seam.workspaces.list()
```

#### Console Session Token

A Console Session Token is used by the Seam Console.
This authentication method is only used by internal Seam applications.

```ts
// Pass as an option to the constructor
const seam = new SeamWithoutWorkspace({
  consoleSessionToken: 'some-console-session-token',
})

// Use the factory method
const seam = SeamWithoutWorkspace.fromConsoleSessionToken(
  'some-console-session-token',
)

// List workspaces authorized for this Seam Console user
const workspaces = await seam.workspaces.list()
```

### Advanced Usage

#### Additional Options

In addition to the various authentication options,
the constructor takes some advanced options that affect behavior.

```ts
const seam = new Seam({
  apiKey: 'your-api-key',
  endpoint: 'https://example.com',
  timeout: 30000,
  axiosOptions: {},
  axiosRetryOptions: {},
})
```

When using the static factory methods,
these options may be passed in as the last argument.

```ts
const seam = Seam.fromApiKey('some-api-key', {
  endpoint: 'https://example.com',
  timeout: 30000,
  axiosOptions: {},
  axiosRetryOptions: {},
})
```

#### Setting the endpoint

Some contexts may need to override the API endpoint,
e.g., testing or proxy setups.
This option corresponds to the Axios `baseURL` setting.

Either pass the `endpoint` option, or set the `SEAM_ENDPOINT` environment variable.

#### Setting the request timeout

Requests time out after 30 seconds by default.
Pass the `timeout` option, in milliseconds, to override this:

```ts
const seam = new Seam({
  apiKey: 'your-api-key',
  timeout: 60000,
})
```

Set `timeout` to `0` to disable the timeout entirely.
A request that times out rejects with an Axios `ETIMEDOUT` error.
Timed-out idempotent requests are retried according to the retry options, with
the timeout reset for each attempt. Non-idempotent requests are not retried by
default.

#### Configuring the Axios Client

The Axios client and retry behavior may be configured with custom initiation options
via [`axiosOptions`][axiosOptions] and [`axiosRetryOptions`][axiosRetryOptions].
Options are shallow merged with the default options:
each provided top-level option replaces the default value.

By default, the SDK makes up to three attempts: the initial request and two
retries. Retries are limited to `GET`, `HEAD`, `OPTIONS`, `PUT`, and `DELETE`
requests that fail because of a transport error, timeout, HTTP 429 response, or
HTTP 5xx response. `POST` and `PATCH` requests are not retried.

Retries use exponential backoff with jitter: approximately 200–240 ms before
the first retry and 400–480 ms before the second. A longer `Retry-After` header
is honored. The request timeout is reset for each attempt.

[axiosOptions]: https://axios-http.com/docs/config_defaults
[axiosRetryOptions]: https://github.com/softonic/axios-retry

#### Using the Axios Client

The Axios client is exposed and may be used or configured directly:

```ts
import { Seam, DevicesListResponse } from 'seam'

const seam = new Seam()

seam.client.interceptors.response.use((response) => {
  console.log(response)
  return response
})

const devices = await seam.client.get<DevicesListResponse>('/devices/list')
```

#### Overriding the Client

An Axios compatible client may be provided to create a `Seam` instance.
This API is used internally and is not directly supported.

#### Alternative endpoint path interface

The `SeamEndpoints` class offers an alternative path-based interface to every API endpoint.
Each endpoint is exposed as simple property that returns the corresponding method from `Seam`.

```ts
import { SeamEndpoints } from 'seam'

const seam = new SeamEndpoints()
const devices = await seam['/devices/list']()
```

#### Inspecting the Request

All client methods return an instance of `SeamHttpRequest`.
Inspect the request before it is sent to the server by intentionally not awaiting the `SeamHttpRequest`:

```ts
const seam = new Seam('your-api-key')

const request = seam.devices.list()

console.log(`${request.method} ${request.url}`, JSON.stringify(request.body))

const devices = await request.execute()
```

A `SeamHttpRequest` is sent at most once.
Awaiting the same request again,
or calling `execute`, `then`, `catch`, or `finally` more than once,
always returns the result of the first execution
and never repeats the HTTP request.

#### Serializing URL search params

The Seam API parses URL search params as complex types.
If you call it with your own HTTP client, use `serializeUrlSearchParams`:

```ts
import axios from 'axios'
import { serializeUrlSearchParams } from 'seam'

await axios.get('https://connect.getseam.com/devices/list', {
  params: { device_ids: ['device1', 'device2'] },
  paramsSerializer: serializeUrlSearchParams,
  headers: { Authorization: 'Bearer your-api-key' },
})
```

or `updateUrlSearchParams`:

```ts
import { updateUrlSearchParams } from 'seam'

const searchParams = new URLSearchParams()
updateUrlSearchParams(searchParams, { device_ids: ['device1', 'device2'] })

Array.from(searchParams)
// => [['device_ids', 'device1'], ['device_ids', 'device2'], ['_strict', 'true']]

searchParams.toString()
// => 'device_ids=device1&device_ids=device2&_strict=true'
```

The helpers wrap the [reference implementation].
The serialization defines the name and string value of each search param.
[`URLSearchParams`][URLSearchParams] holds those pairs and renders the query string:
The `_strict=true` parameter is added to any non-empty query so the Seam API uses
strict, schema-aware parsing.
A query with no serializable params remains empty.

A param set to `undefined` is omitted, while a param set to `null` is serialized
to an empty value, which the Seam API reads as null.
A param that cannot be represented raises an `UnserializableParamError`.
The Seam API parses these params with the corresponding [parser].

[URLSearchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[reference implementation]: https://github.com/seamapi/url-search-params-serializer
[parser]: https://github.com/seamapi/url-search-params-parser

### Command Line Interface

Every `seam` command makes its request as soon as every required property is
given. When something is missing, the CLI prompts you for it with helpful
suggestions.

Pass `--interactive` (or `-i`) to always be prompted to review and edit
properties before the request is made. The prompt is prefilled with whatever
you passed as arguments or piped in as JSON, and each property you open is
prefilled with the value it has, ready to edit rather than retype. This is the
way to add optional properties, or to check a request before making it.

For scripts and CI, pass `--non-interactive` (or `-y`) to never be prompted.
The command must then be complete: if the command itself is ambiguous, or any
required property is missing, the CLI exits with an error naming what is
missing instead of asking for it.

To take a project from zero to a working Seam integration, run the
[Seam Wizard] from the project's root:

```bash
seam wizard
```

For API commands:

```bash
# Login to Seam
seam login

# Select your workspace
seam select workspace

# Interactively select commands to execute
seam

# Create a connect webview to connect devices
seam connect-webviews create

# List devices in your workspace
seam devices list

# Review and edit filters before listing devices
seam devices list --interactive

# List devices, failing instead of prompting
seam devices list --non-interactive

# Fails with: Missing required parameter for /locks/unlock_door: --device-id
seam locks unlock-door --non-interactive

# Fails with: Unknown parameter for /devices/list: --limitt
seam devices list --limitt 5

MY_DOOR=$(seam devices get --name "Front Door" | jq -r '.device.device_id')

# Unlock a lock
seam locks unlock-door --device-id $MY_DOOR

# Create an access code
seam access-codes create --code "1234" --name "My Code"

# List your access codes
seam access-codes list --device-id $MY_DOOR
```

### Output

Only the response is written to stdout, so any command may be piped or
redirected. Prompts, progress, and other information are written to stderr.

The response is trimmed to the response key and pagination: no other top level
fields are reported.

```bash
# The response, and nothing else, ends up in the file
seam devices list > devices.json

# Prompts and progress still show up in the terminal
seam devices list | jq '.devices[].device_id'
```

### Pagination

Every command that paginates accepts `--page-cursor` to select a page of
results, alongside `--limit` for the size of that page. Each response reports
its `pagination`, whose `next_page_cursor` is the cursor for the page after it.

```bash
# The first page, and the cursor for the next one
seam devices list --limit 2 | jq '.pagination.next_page_cursor'

# The page after it
seam devices list --limit 2 --page-cursor "$CURSOR"
```

A cursor is opaque: pass it back exactly as it was reported, and do not build
one yourself. Run `seam <command> --help` to see whether a command paginates.

### JSON

Request params may be piped or redirected in as a JSON object, or passed
inline with `--raw`. Params given as arguments win over raw or stdin params.

An argument the command does not accept is an error, so a typo is reported
rather than sent. Params read from stdin are passed through as given, so
anything the API itself accepts may be sent that way.

```bash
# Read params from a file
seam locks unlock-door < params.json

# Or from another program
echo '{"device_id": "'"$MY_DOOR"'"}' | seam locks unlock-door

# Pass request params inline as JSON
seam devices list --raw '{"search":"bar"}'

# --device-id wins over any device_id in params.json
seam devices list --limit 5 < params.json
```

Pass `--json` to write the response as JSON. It is enabled automatically
whenever stdout is not a terminal, so piping and redirecting produce JSON
without passing anything. Pass `--no-json` to opt out and get the pretty
format instead.

```bash
# Both write JSON
seam devices list --json
seam devices list | jq

# Pretty printed, even though it is piped
seam devices list --no-json | less
```

Without a terminal to prompt on, the CLI behaves as though
`--non-interactive` was given: rather than waiting for an answer nobody can
give, it exits with an error naming what is missing.

```bash
$ echo '{}' | seam locks unlock-door
Missing required parameter for /locks/unlock_door: --device-id
```

An error exits non-zero. A request that fails reports its `error` on stdout,
so it can be inspected from a pipe; anything else is written to stderr only.

### Selecting an endpoint and a workspace

Two settings say where commands go, and one command each stores them:

```bash
# Every later command runs against this endpoint
seam select endpoint https://connect.getseam.com

# ...and this workspace
seam select workspace $MY_WORKSPACE
```

Run either without a value to pick one interactively.

To send a single command somewhere else, pass `--endpoint` or
`--workspace-id` to that command. They override what is selected for that one
invocation and store nothing:

```bash
# List devices in another workspace, without switching to it
seam devices list --workspace-id $OTHER_WORKSPACE

# Run one command against a local Seam Connect instance
seam devices list --endpoint http://localhost:3020

# Log in to another endpoint: the token is stored for that endpoint,
# and the selected one is left alone
seam login --endpoint http://localhost:3020 --token $LOCAL_KEY
```

Because the two flags never store anything, they are refused on the commands
that do: `seam select endpoint --endpoint <url>` is an error, and the value
belongs after the command instead.

### Environment variables

Everything `seam login`, `seam select workspace`, and `seam select endpoint`
store may be given in the environment instead:

- `SEAM_CLI_TOKEN`: a Personal Access Token or API Key,
- `SEAM_CLI_WORKSPACE_ID`: the workspace requests are made against,
- `SEAM_CLI_ENDPOINT`: the Seam API endpoint requests are made to.

Any of them, all of them, or none of them may be set. Each one wins over the
corresponding stored value and is in turn overridden by `--endpoint` or
`--workspace-id`, which makes them useful for CI or for working against
another workspace for a whole shell.

```bash
# One command against another workspace
SEAM_CLI_WORKSPACE_ID=$OTHER_WORKSPACE seam devices list

# No login needed: authenticate from the environment
export SEAM_CLI_TOKEN=$SEAM_API_KEY
seam devices list

# Work against a local Seam Connect instance
SEAM_CLI_ENDPOINT=http://localhost:3020 seam devices list
```

An API Key is scoped to a single workspace, so it needs no workspace id. A
Personal Access Token works across workspaces, so it needs one from
`--workspace-id`, `SEAM_CLI_WORKSPACE_ID`, or `seam select workspace`.

The command that would store an overridden value fails rather than storing
something the environment ignores: `seam login` and `seam logout` while
`SEAM_CLI_TOKEN` is set, `seam select workspace` while
`SEAM_CLI_WORKSPACE_ID` is set, and `seam select endpoint` while
`SEAM_CLI_ENDPOINT` is set. Unset the variable to use those commands.

```bash
$ SEAM_CLI_TOKEN=$SEAM_API_KEY seam login
Cannot log in while SEAM_CLI_TOKEN is set: it overrides what would be stored. Unset SEAM_CLI_TOKEN to log in.
```

### Receiving Webhooks

The Seam API implements webhooks using [Svix](https://www.svix.com).
This SDK exports a thin wrapper `SeamWebhook` around the svix package.
Use it to parse and validate [Seam webhook events](https://docs.seam.co/latest/developer-tools/webhooks).

Refer to the [Svix docs on Consuming Webhooks](https://docs.svix.com/receiving/introduction)
for an in-depth guide on best-practices for handling webhooks in your application.

Verification failures throw Svix's `WebhookVerificationError`, re-exported as
`SeamWebhookVerificationError`.
A payload that is correctly signed but unreadable throws a `SeamInvalidWebhookPayloadError`.

```js
import { isSeamInvalidWebhookPayloadError, SeamWebhook } from 'seam'

try {
  data = webhook.verify(req.body, req.headers)
} catch (err) {
  if (isSeamInvalidWebhookPayloadError(err)) {
    console.error('Unreadable Seam webhook payload', err)
    return res.status(204).send()
  }
  return res.status(400).send()
}
```

> [!TIP]
> This example is for [Express](https://expressjs.com/),
> see the [Svix docs for more examples in specific frameworks](https://docs.svix.com/receiving/verifying-payloads/how).

```js
import { env } from 'node:process'

import { SeamWebhook } from 'seam'
import express from 'express'
import bodyParser from 'body-parser'

const app = express()

const webhook = new SeamWebhook(env.SEAM_WEBHOOK_SECRET)

app.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  (req, res) => {
    let data
    try {
      data = webhook.verify(req.body, req.headers)
    } catch {
      return res.status(400).send()
    }
    storeEvent(data, (err) => {
      if (err != null) {
        return res.status(500).send()
      }
      res.status(204).send()
    })
  },
)

const storeEvent = (data, callback) => {
  console.log(data)
  callback()
}

app.listen(8080, () => {
  console.log('Ready to receive webhooks at http://localhost:8080/webhook')
})
```

## Development and Testing

### Quickstart

```
$ git clone https://github.com/seamapi/javascript.git
$ cd javascript
$ nvm install
$ npm install
```

Primary development tasks are defined under `scripts` in `package.json`
and available via `npm run`.
View them with

```
$ npm run
```

### Source code

The [source code] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:seamapi/javascript.git
```

[source code]: https://github.com/seamapi/javascript

### Requirements

You will need [Node.js] with [npm] and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ npm install
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

### Publishing

#### Automatic

New versions are released automatically with [semantic-release]
as long as commits follow the [Angular Commit Message Conventions].

[Angular Commit Message Conventions]: https://semantic-release.gitbook.io/semantic-release/#commit-message-format
[semantic-release]: https://semantic-release.gitbook.io/

#### Manual

Publish a new version by triggering a [version workflow_dispatch on GitHub Actions].
The `version` input will be passed as the first argument to [npm-version].

This may be done on the web or using the [GitHub CLI] with

```
$ gh workflow run version.yml --raw-field version=<version>
```

[GitHub CLI]: https://cli.github.com/
[npm-version]: https://docs.npmjs.com/cli/version
[version workflow_dispatch on GitHub Actions]: https://github.com/seamapi/javascript/actions?query=workflow%3Aversion

## GitHub Actions

_GitHub Actions should already be configured: this section is for reference only._

The following repository secrets must be set on [GitHub Actions]:

- `GH_TOKEN`: A personal access token for the bot user with
  and `contents:write` permission.
- `GIT_USER_NAME`: The GitHub bot user's real name.
- `GIT_USER_EMAIL`: The GitHub bot user's email.
- `GPG_PRIVATE_KEY`: The GitHub bot user's [GPG private key].
- `GPG_PASSPHRASE`: The GitHub bot user's GPG passphrase.

[GitHub Actions]: https://github.com/features/actions
[GPG private key]: https://github.com/marketplace/actions/import-gpg#prerequisites

## Contributing

> If using squash merge, edit and ensure the commit message follows the [Angular Commit Message Conventions] specification.
> Otherwise, each individual commit must follow the [Angular Commit Message Conventions] specification.

1. Create your feature branch (`git checkout -b my-new-feature`).
2. Make changes.
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin my-new-feature`).
5. Create a new draft pull request.
6. Ensure all checks pass.
7. Mark your pull request ready for review.
8. Wait for the required approval from the code owners.
9. Merge when ready.

[Angular Commit Message Conventions]: https://semantic-release.gitbook.io/semantic-release/#commit-message-format

## License

This npm package is licensed under the MIT license.

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
