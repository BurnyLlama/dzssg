#!/bin/env bash

source .env

echo "Creating directories..."
mkdir -p "$CONTENT_PATH/{fonts,media,posts,scss,views/{components,pages,templates}}"

mkdir out
