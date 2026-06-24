#!/bin/bash
docker exec rh-management-mongodb mongosh admin --username admin --password admin123 --eval "db.getUsers()"
