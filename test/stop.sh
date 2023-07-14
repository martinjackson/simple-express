#!/bin/bash

#  move to directory where the script resides
cd "$(dirname "$0")"


NODE_PID=$(cat server.pid)

sudo kill $NODE_PID
