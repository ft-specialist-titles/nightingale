# Release Process: Continuous Deployment

**Submitting a PR**
 * Please read [Contributing.md](CONTRIBUTING.md)

**Accepting a PR**
 * Review code within GitHub
 * Checkout the PR branch
 * Merge master
 * `npm test` : Run the tests
 * Merge the PR into master
 * `npm test` : Run the tests again
 * `npm run report` : take a look at the code coverage
 * `git push` : to kick of the deploy process

CircleCI will then run your tests, and if successful:
 * Push the demo `site` to github.io

## Deploying to Directly Github.io

> To push an update to the demo pages in isolation

`npm run release -- gh-pages`

This will push the current files within `_site` to gh-pages branch (making your demo available on github.io).
