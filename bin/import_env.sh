#!/bin/bash

# Load environment variables from .env file
if [ -f ../.env ]; then
  # If the .env file exists, source it
  source ../.env
else
  echo ".env file not found"
  exit 1
fi

