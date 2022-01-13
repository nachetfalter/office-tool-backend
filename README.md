# Office Tool Backend

## Overview

This is the backend of a collection of utility tools for processing PDF and text. You can find the project board [here](https://trello.com/b/veKujmZv/task-board)

## Setup Guide (Ubuntu)

*Please make sure you have [Serverless framework](https://www.serverless.com/) setup on your local if you wish to deploy. To deploy, you will also need to setup your AWS account*

1. `sudo apt-get install ghostscript`
2. `sudo apt-get install graphicsmagick`
3. `yarn && yarn start`

## Helpful Commands

* `yarn test`

* `yarn lint` (will run coverage)

* `yarn deploy` (require Serverless and AWS setup)
