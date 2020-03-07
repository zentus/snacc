#!/bin/bash
type=$1;
tag="";

function set-tag() {
	tag=$(npm version ${type});
}

function push-code() {
	git push && git push origin "${tag}" && npm publish
}

echo "* Installing" &&
npm install &&
echo "* Linting" &&
npm run lint &&
echo "* Releasing ${tag}" &&
set-tag &&
push-code
