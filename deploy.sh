#!/bin/bash

git branch -D deploy
git branch deploy master
git checkout deploy

yarn build

mv .gitignore.deploy .gitignore
git add .
git commit -m "Deploy"
git push --set-upstream origin deploy --force

git checkout master
