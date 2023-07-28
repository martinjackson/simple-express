#!/bin/bash

# source ./.env
API_PORT=8000

PID=$(sudo lsof -i -P -n | grep LISTEN | grep $API_PORT | awk '{ print $2 }')
if [ -z "$PID" ]
then
   echo "Nothing running on Port $API_PORT"
   exit 0
fi

ps aux | grep $PID | grep -v grep


