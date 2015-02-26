# Contributing

Like most open source projects, we ask that you fork the project and issue a [pull request](/pull-requests) with your changes.

We encourage small change pull requests, the smaller the change the quicker and easier it is merged.

## Dependencies

To build the Nightingale locally, you'll need to install:
 * [NodeJS](http://nodejs.org/)
 * [Bower](http://bower.io/)
 * [srvlr](https://github.com/kavanagh/srvlr)

## pre-requisits

if behind a proxy run, setup git to use https:

 `git config --global url."https://".insteadOf git://`

## Workflow

1. Fork the project
2. Clone your fork
`ssh://git@git.svc.ft.com:7999/~YOUR-USERNAME/nightingale.git`
3. Setup your 'upstream'
`git remote add upstream ssh://git@git.svc.ft.com:7999/igct/nightingale.git`
4. Run `npm i && bower i`
5. Create a topic branch to contain your change
`git checkout -b my-feature`
6. Hack, hack, hack
7. Make sure [CHANGELOG.md](./CHANGELOG.md) includes a summary of your changes in a new version number heading
8. Make sure you are still up to date with master
`git pull upstream master`
9. If necessary, rebase your commits into logical chunks, without errors.
10. Push the branch up
`git push origin my-feature`
11. Create a pull request and describe what your change does and the why you think it should be merged.

## Running Locally

 * `npm run start`
 * `npm test`

