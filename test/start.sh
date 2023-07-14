#!/bin/bash

fullfile=${0}                  # possibly pathed scriptname

cd "$(dirname "$0")"

pwd

mkdir -p logs

# stop previous if it is running
. ./stop.sh

node  --trace-warnings server.js SIMPLE_EXPRESS_TEST &
echo "$!" >server.pid
