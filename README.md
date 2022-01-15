# Office Tool Backend

![CI/CD](https://github.com/nachetfalter/office-tool-backend/workflows/office-tool-backend-cicd/badge.svg)
[![codecov](https://codecov.io/gh/nachetfalter/office-tool-backend/branch/main/graph/badge.svg)](https://app.codecov.io/gh/nachetfalter/office-tool-backend)
![GitHub last commit](https://img.shields.io/github/last-commit/nachetfalter/office-tool-backend)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/nachetfalter/office-tool-backend)

## Overview

This is the backend of a collection of utility tools for processing PDF and text. You can find the project board [here](https://trello.com/b/veKujmZv/task-board)

## Setup Guide (Ubuntu)

*Please make sure you have [Serverless framework](https://www.serverless.com/) setup on your local if you wish to deploy. To deploy, you will also need to setup your AWS account*

1. `sudo apt-get install ghostscript`
2. `sudo apt-get install graphicsmagick`
3. Please make a `.env` file like `.env.example` and set `ENVIRONMENT` to 'local' if you will be running on a local environment
4. `yarn && yarn start` (If you run on local, the server will be at `:8000`)

## Helpful Commands

* `yarn test`

* `yarn lint` (will run coverage)

* `yarn deploy` (require Serverless and AWS setup)
