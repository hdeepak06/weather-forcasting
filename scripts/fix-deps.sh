#!/bin/bash

# Remove corrupted node_modules and lock files
rm -rf node_modules package-lock.json

# Install dependencies using pnpm
pnpm install

echo "Dependencies reinstalled successfully"
