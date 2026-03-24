#!/bin/bash
while true; do
    echo "Starting server..."
    node .next/standalone/server.js
    echo "Server exited, restarting in 2 seconds..."
    sleep 2
done
