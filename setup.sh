#!/bin/env bash

source .env

echo "Creating default folder structure..."
cp -rv ./resources/default-folder-structure/* "$CONTENT_PATH"

mkdir out
