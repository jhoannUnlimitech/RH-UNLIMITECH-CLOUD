#!/bin/bash
docker exec rh-management-mongodb mongosh "mongodb://admin:admin123@localhost:27017/rh_management?authSource=admin" --eval 'db.test.insertOne({test: 1})'
