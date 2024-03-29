# Seam JavaScript SDK

[![npm](https://img.shields.io/npm/v/seam.svg)](https://www.npmjs.com/package/seam)
[![GitHub Actions](https://github.com/seamapi/javascript-next/actions/workflows/check.yml/badge.svg)](https://github.com/seamapi/javascript-next/actions/workflows/check.yml)

JavaScript SDK for the Seam API written in TypeScript.

_This repository hosts the next major version of the Seam JavaScript SDK.
This SDK is available for early preview.
It will eventually replace the [seamapi](https://github.com/seamapi/javascript/) package._

## Description

[Seam] makes it easy to integrate IoT devices with your applications.
This is an official SDK for the Seam API.
Please refer to the official [Seam Docs] to get started.

The SDK is fully tree-shakeable
and optimized for use in both client and server applications.

The repository does not contain the SDK code.
Instead, it re-exports from a core set of Seam modules.

_While this SDK is still in preview,
please refer to the individual README files in these repositories for
additional usage documentation not yet available in the primary Seam documentation.
See [this issue for a draft migration guide](https://github.com/seamapi/javascript-next/issues/1) from the seamapi package._

- [@seamapi/http]: JavaScript HTTP client for the Seam API written in TypeScript.
- [@seamapi/webhook]: Webhook SDK for the Seam API written in TypeScript.
- [@seamapi/types]: TypeScript types for the Seam API.

[Seam]: https://www.seam.co/
[Seam Docs]: https://docs.seam.co/latest/
[@seamapi/types]: https://github.com/seamapi/types
[@seamapi/http]: https://github.com/seamapi/javascript-http
[@seamapi/webhook]: https://github.com/seamapi/javascript-webhook

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install seam
```

[npm]: https://www.npmjs.com/

## Usage

#### Unlock a door

```ts
import { Seam } from 'seam'

const seam = new Seam()
const lock = await seam.locks.get({ name: 'Front Door' })
await seam.locks.unlockDoor({ device_id: lock.device_id })
```

#### Parse and validate a webhook

```ts
import { SeamWebhook } from 'seam'

const webhook = new SeamWebhook('webhook-secret')
const data = webhook.verify(payload, headers)
```

## Development and Testing

### Quickstart

```
$ git clone https://github.com/seamapi/javascript-next.git
$ cd javascript-next
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
$ git clone git@github.com:seamapi/javascript-next.git
```

[source code]: https://github.com/seamapi/javascript-next

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
[version workflow_dispatch on GitHub Actions]: https://github.com/seamapi/javascript-next/actions?query=workflow%3Aversion

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
