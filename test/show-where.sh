#!/bin/bash

ps aux | grep 'node ' | grep -v vscode | grep -v snapfuse | grep -v grep | awk '{ print $2 }' | xargs pwdx

