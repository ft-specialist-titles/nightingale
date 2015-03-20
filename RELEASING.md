# Release Process: Continuous Deployment

> This method relies on the version number being incremented manually before code is pushed to Git.

 * Ensure all changes are made and pushed to feature branches
 * Once the feature/bug-fix is complete, rebase from master.
 * Merge your changes into master
 * `npm test` : Run the tests again
 * `component bump` : See [bump-the-version](#bump-the-version) for options.
 * `git push` : to kick of the deploy process

CircleCI will then run your tests, and if successful:
 * Tag the version number and push to Git
 * Push the demo `site` to github.io
 * Push the compiled assets to the S3 (if configured)

Your `circle.yml` should look something like:

## Deploying to Github.io

> To push an update to the demo pages in isolation

`component release gh-pages`

This will push the current files within `_site` to gh-pages branch (making your demo available on github.io).


## Bump the Version

> Bump the version within your app

`component bump`

This will update the version number in all the docs (package.json, version.js, *.md and *.html).

By default, this applies a  `patch`.  Add either `patch`, `minor`, `major`, `prerelease` or even `v3.2.1` to specify the type of bump.

i.e. `component bump major`