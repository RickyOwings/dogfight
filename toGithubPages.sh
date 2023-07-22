#!/bin/bash

read -p "Commit message: " comMes

node updateMusicJSON.cjs
npx snowpack build
git add .
git commit -m "$comMes"
git push
git subtree push --prefix build origin gh-pages
