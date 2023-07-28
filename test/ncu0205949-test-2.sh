#!/bin/bash

cd /home/mjackson/projects/simple-express/test

HOST=$(hostname --fqdn)
echo "go to https://${HOST}:8000"

node ./server.js --https --port 8000 --public './public/' --fqdn "$HOST" --nolog SIMPLE_EXPRESS_TEST

