#!/bin/bash

cd /home/mjackson/projects/simple-express/test

echo "go to https://www.ssllabs.com/ssltest/analyze.html  and enter https://streamof.info"

sudo node ./server.js --https --port 443 --public './public/' --fqdn 'streamof.info' SIMPLE_EXPRESS_TEST

