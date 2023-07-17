#!/bin/bash

#  move to directory where the script resides
cd "$(dirname "$0")"

# get PROCESS_NAME
. ./.env

# NODE_PID=$(cat server.pid)
NODE_PIDS=$(ps aux | grep "$PROCESS_NAME" | grep node | grep -v sudo | awk '{print $2 " "}' | tr -d '\n' | sed 's/ *$//g')

if [ ! -z "$NODE_PIDS" ]
then
    echo "Killing all $PROCESS_NAME ($NODE_PIDS)"

    sudo kill $NODE_PIDS  >/dev/null 2>&1
fi

