#!/bin/bash
type=$1
tag=$(npm version ${type})

echo "Releasing ${tag} ... \n"
npm install && npm run lint && git push && git push origin "${tag}" && npm publish
