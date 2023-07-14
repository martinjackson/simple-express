#!/bin/bash

cd /home/mjackson/projects/simple-express/test

sudo node ./server.js --https --port 443 --public './public/' --fqdn 'streamof.info' SIMPLE_EXPRESS_TEST


