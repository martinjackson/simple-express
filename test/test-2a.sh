#!/bin/bash

API_PORT=8000

cd /home/mjackson/projects/simple-express/test

# PORT_IN_USE=$(lsof -i :8000 -s TCP:LISTEN | wc -l)
PID=$(sudo lsof -i -P -n | grep LISTEN | grep $API_PORT | awk '{ print $2 }')
if [ -z "$PID" ]
then
   echo "Nothing running on Port $API_PORT"
else
   echo "something already running on Port $API_PORT"
   pwdx $PID
   exit 0
fi

HOST="localhost"
echo "go to https://${HOST}:${API_PORT}"

node ./server2.js SIMPLE_EXPRESS_TEST logs/test-2a-server.log > ./test-2a.log 2>&1 &

