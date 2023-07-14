#!/bin/bash

sudo netstat -plnt | grep -v udp | grep -v cupsd
echo " "
sudo lsof -i | grep -v sshd | grep -v UDP | grep -v cupsd
echo " "
sudo netstat -tulpn | grep -v udp | grep -v cupsd
echo " "