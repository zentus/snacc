#!/bin/bash
type=$1
tag=$(npm version ${type})

echo "Releasing ${tag} ... \n"
npm install
git push && git push origin "${tag}"
echo "Publishing ${tag} ... \n"
npm publish
