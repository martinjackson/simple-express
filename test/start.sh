#!/bin/bash

fullfile=${0}                  # possibly pathed scriptname

cd "$(dirname "$0")"

pwd

mkdir -p logs

# stop previous if it is running
. ./stop.sh

sudo node  --trace-warnings server.js --public './public' --fqdn 'streamof.info' SIMPLE_EXPRESS_TEST &
echo "$!" >server.pid
