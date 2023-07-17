#!/bin/bash

fullfile=${0}                  # possibly pathed scriptname

cd "$(dirname "$0")"

mkdir -p logs
LOG=$(date +"logs/server-%Y-%m-%d.log")

# get PROCESS_NAME
. ./.env

# stop previous if it is running
. ./stop.sh

# echo "Can't attach vscode debug to a sudo node process"
# echo "See launch.json   name: 'https test'  "
# echo "debug on ports > 1000"

sudo sh -c "node  --trace-warnings server.js \
     --public './public' --fqdn 'streamof.info' $PROCESS_NAME      >$LOG 2>&1 &"
