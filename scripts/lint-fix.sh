#!/bin/bash
find source -name '*.js' ! -type d -exec bash -c 'expand -t 4 "$0" > /tmp/e && mv /tmp/e "$0"' {} \;
eslint source --fix
