#!/bin/bash

# Vercel CLI Plugin - Shell Wrapper
# This wrapper makes the TypeScript CLI more convenient to use

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_PATH="$SCRIPT_DIR/cli.ts"

# Check if we're in the correct directory
if [ ! -f "$CLI_PATH" ]; then
    echo "Error: cli.ts not found at $CLI_PATH" >&2
    exit 1
fi

# Check if ts-node is available
if ! command -v npx >/dev/null 2>&1; then
    echo "Error: npx not found. Please install Node.js" >&2
    exit 1
fi

# Check if node_modules exists, if not suggest running npm install
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo "Warning: node_modules not found. Run 'npm install' in $SCRIPT_DIR" >&2
fi

# Change to the plugin directory and run the CLI
cd "$SCRIPT_DIR" || exit 1

# Run the TypeScript CLI with all passed arguments
npx ts-node "$CLI_PATH" "$@"