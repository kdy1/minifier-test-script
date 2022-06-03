#!/usr/bin/env bash
set -eu

JSON_STRING="$1"

echo $JSON_STRING >> "./compress.json"

npm run build