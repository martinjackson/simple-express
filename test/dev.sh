#!/bin/bash

. ./oracle-env.sh
mkdir -p logs

# stop previous if it is running
. ./stop.sh

node  --trace-warnings server.js --nolog SIMPLE_EXPRESS_TEST
echo "$!" >server.pid
