#!/bin/sh

if tail -n 10 /mosquitto/log/mosquitto.log | grep -q "mosquitto version 2.0.18 running"; then
  exit 0
else
  exit 1
fi
