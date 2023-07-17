#!/bin/bash

PROCS=$(ps aux | grep SIMPLE_EXPRESS_TEST | grep node | awk '{print $2}')

echo $PROCS