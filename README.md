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
Instead, it re-exports from a core set of Seam modules:

- [@seamapi/http]: JavaScript HTTP client for the Seam API written in TypeScript.
- [@seamapi/webhook]: Webhook SDK for the Seam API written in TypeScript.
- [@seamapi/types]: TypeScript types for the Seam API.

[Seam]: https://www.seam.co/
[Seam Docs]: https://docs.seam.co/latest/
[@seamapi/types]: https://github.com/seamapi/types
[@seamapi/http]: https://github.com/seamapi/javascript-http
[@seamapi/webhook]: https://github.com/seamapi/javascript-webhook

## Contents

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
  - [Interacting with Multiple Workspaces](#interacting-with-multiple-workspaces)
    - [Personal Access Token](#personal-access-token-1)
    - [Console Session Token](#console-session-token-1)
  - [Advanced Usage](#advanced-usage)
    - [Additional Options](#additional-options)
    - [Setting the endpoint](#setting-the-endpoint)
    - [Configuring the Axios Client](#configuring-the-axios-client)
    - [Using the Axios Client](#using-the-axios-client)
    - [Overriding the Client](#overriding-the-client)
    - [Inspecting the Request](#inspecting-the-request)
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

### Interacting with Multiple Workspaces

Some Seam API endpoints interact with multiple workspaces.
The `SeamMultiWorkspace` client is not bound to a specific workspace
and may use those endpoints with an appropriate authentication method.

#### Personal Access Token

A Personal Access Token is scoped to a Seam Console user.
Obtain one from the Seam Console.

```ts
// Pass as an option to the constructor
const seam = new SeamMultiWorkspace({
  personalAccessToken: 'your-personal-access-token',
})

// Use the factory method
const seam = SeamMultiWorkspace.fromPersonalAccessToken(
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
const seam = new SeamMultiWorkspace({
  consoleSessionToken: 'some-console-session-token',
})

// Use the factory method
const seam = SeamMultiWorkspace.fromConsoleSessionToken(
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
  axiosOptions: {},
  axiosRetryOptions: {},
})
```

When using the static factory methods,
these options may be passed in as the last argument.

```ts
const seam = Seam.fromApiKey('some-api-key', {
  endpoint: 'https://example.com',
  axiosOptions: {},
  axiosRetryOptions: {},
})
```

#### Setting the endpoint

Some contexts may need to override the API endpoint,
e.g., testing or proxy setups.
This option corresponds to the Axios `baseURL` setting.

Either pass the `endpoint` option, or set the `SEAM_ENDPOINT` environment variable.

#### Configuring the Axios Client

The Axios client and retry behavior may be configured with custom initiation options
via [`axiosOptions`][axiosOptions] and [`axiosRetryOptions`][axiosRetryOptions].
Options are deep merged with the default options.

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

#### Inspecting the Request

All client methods return an instance of `SeamHttpRequest`.
Inspect the request before it is sent to the server by intentionally not awaiting the `SeamHttpRequest`:

```ts
const seam = new Seam('your-api-key')

const request = seam.devices.list()

console.log(`${request.method} ${request.url}`, JSON.stringify(request.body))

const devices = await request.execute()
```

### Receiving Webhooks

First, create a webhook using the Seam API or Seam Console
and obtain a Seam webhook secret.

> [!TIP]
> This example is for [Express], see the [Svix docs for more examples in specific frameworks](https://docs.svix.com/receiving/verifying-payloads/how).

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

[Express]: https://expressjs.com/

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

- `NPM_TOKEN`: npm token for installing and publishing packages.
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
