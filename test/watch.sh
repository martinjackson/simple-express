#!/bin/bash

tail -F "$(ls -t logs/* | head -n1)" &
