#!/bin/bash

source ./import_env.sh

docker build -t "$DOCKER_PROJECT_NAME" -f ../docker/Dockerfile ../
