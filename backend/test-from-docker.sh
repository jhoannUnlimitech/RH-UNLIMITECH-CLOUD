#!/bin/bash
cd /home/jeacosta37/RH-UNLIMITECH/RH-UNLIMITECH-CLOUD/backend
docker run --rm --network rh-unlimitech-cloud_rh-network -v $(pwd):/app -w /app node:20 node test-native-driver.js
