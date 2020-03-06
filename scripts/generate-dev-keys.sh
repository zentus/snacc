#!/bin/bash
rm -rf ./dev-certificate
mkdir ./dev-certificate
openssl genrsa -des3 -passout pass:devcert -out ./dev-certificate/server-pair.key 2048
openssl rsa -passin pass:devcert -in ./dev-certificate/server-pair.key -out ./dev-certificate/server.key
rm -rf ./dev-certificate/server-pair.key
openssl req -new -key ./dev-certificate/server.key -out ./dev-certificate/server.csr
openssl x509 -req -days 365 -in ./dev-certificate/server.csr -signkey ./dev-certificate/server.key -out ./dev-certificate/server.cert
rm -rf ./dev-certificate/server.csr
