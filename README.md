# TGS Webpanel

React web app to control TGS

| CI Badges |                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Linting   | ![Node.js CI](https://github.com/tgstation/tgstation-server-control-panel/workflows/Node.js%20CI/badge.svg) |

## Currently supported browsers

last 5 chrome version
last 5 firefox version
last 3 edge version
last 5 opera version
last 3 safari version

## Install

1. Install [Bun](https://bun.sh/)
2. Clone the repository
3. Run `bun install` to install dependencies

## Development

To run a test server, make sure you have ran `bun install` beforehand to install dependencies then simply run `bun start`, the first build may take anywhere from a dozen of seconds to 2 minutes depending on your machine but subsequent changes to the file system will get picked up by the dev server and those will usually be built much faster. The app will hot swap components.

Make sure to run `bun install` again if you pull in new changes from the repo

## Scripts

|              |                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| start        | Starts a development server that listens on `0.0.0.0:8080` The server will watch for changes in the file system to recompile |
| generate-api | Redownloads the api spec from tgstation-server and generates typings and the axios backend.                                  |
| build        | Builds a production version in `/dist`                                                                                       |
| lint         | Runs eslint on the codebase to check for errors                                                                              |
| lint-fix     | Runs eslint on the codebase to check for errors but also attempts to fix said errors                                         |
| build-dev    | Builds a development version in `/dist`                                                                                      |
|              |                                                                                                                              |

## License

This work is licensed under AGPL-3.0. See the LICENSE file for more information.
