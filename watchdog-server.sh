#!/bin/bash
cd /home/z/my-project
while true; do
    echo "[$(date)] Starting server..." >> watchdog.log
    timeout 3600 node .next/standalone/server.js 2>&1 >> watchdog.log
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE" >> watchdog.log
    sleep 1
done
