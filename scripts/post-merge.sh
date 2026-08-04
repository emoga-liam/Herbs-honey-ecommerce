#!/bin/bash
set -e
yarn install --frozen-lockfile --registry https://registry.npmjs.org/
yarn workspace @workspace/db push
