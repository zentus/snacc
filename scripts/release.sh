#!/bin/bash
type=$1
tag=$(npm version ${type})

echo "* Installing" &&
npm install &&
echo "* Linting" &&
npm run lint &&
echo "* Releasing ${tag}" &&
git push &&
git push origin "${tag}" &&
npm publish
