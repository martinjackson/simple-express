#!/bin/bash

. ./oracle-env.sh
mkdir -p logs

# stop previous if it is running
. ./stop.sh

echo "Warning: http (no s)"
node  --trace-warnings --inspect server.js --http -n $PROCESS_NAME &
echo "$!" >server.pid
