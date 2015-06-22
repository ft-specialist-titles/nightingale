# Contributing

Like most open source projects, we ask that you fork the project and issue a [pull request](/pull-requests) with your changes.

We encourage small change pull requests, the smaller the change the quicker and easier it is merged.

## Dependencies

To build the Nightingale locally, you'll need to install:
 * [NodeJS](http://nodejs.org/)
 * [Bower](http://bower.io/)

## pre-requisites

if behind a proxy run, setup git to use https:

 `git config --global url."https://".insteadOf git://`

acquire a local copy of selenium server standalone and place it into

 `nightingale/test/bin/selenium-server-standalone-2.46.0.jar`

from the following URL:

 `http://goo.gl/cvntq5`

## Workflow

1. `git clone https://github.com/Financial-Times/nightingale.git`
2. Run `npm i && bower i`
3. Create a topic branch to contain your change
`git checkout -b my-feature`
4. Hack, test, hack, test
5. Update [CHANGELOG.md](./CHANGELOG.md) with a summary of your changes
6. Make sure you are still up to date with master
`git pull origin master`
7. If necessary, rebase your commits into logical chunks, without errors.
8. Push the branch up
`git push origin my-feature`
9. Create a pull request and describe what your change does and the why you think it should be merged.

## Running Locally

 * `npm start`
 * `npm test`

