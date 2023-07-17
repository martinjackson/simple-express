#!/bin/bash

mkdir -p logs

# get PROCESS_NAME
. ./.env

# stop previous if it is running
. ./stop.sh

node  --trace-warnings server.js --nolog $PROCESS_NAME

