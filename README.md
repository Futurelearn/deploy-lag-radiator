# Deploy Lag Radiator

Adapted from [dsingleton/deploy-lag-radiator](https://github.com/dsingleton/deploy-lag-radiator) for FutureLearn.

A _information radiator_ / _glancable_ / _stats screen_ to show how far a repo is behind it's latest deployed version. It also shows other information from the github API including the status of the the build and the number of outstanding pull requests.

It's intended to highlight changes that may sit undeployed for a long time, causing a build up of deployment risk.

## Assumptions made about project

It assumes that:

* `master` is updated with the build status using the github status API (TravisCI does this)
* `master-build-passed` branch is updated to the most recently passed master build
* `current-staging` branch is updated to the last commit deployed to staging 
* `current-production` branch is updated to the last commit deployed to production 


## Config

Pass configuration as query params, supported params are;

* `token` - A Github API token
* `repo` - The of repositor name
* `refresh` - How often to update the data in the page, in seconds [_optional_, defaults to `60`]
* `reload_page_rate` - How many refreshes before the page is reloaded [_optional_, defaults to `10`]
* `repo_owner` - The owner of the repository [_optional_, defaults to `futurelearn`]

## Running

This is hosted by github pages. You can see it by going to:
`https://futurelearn.github.io/deploy-lag-radiator/?repo=<REPO_NAME>&token=<GITHUB_APIT_TOKEN>`

