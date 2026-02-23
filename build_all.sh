#!/bin/bash
set -e

# Create jq wrapper for WSL if needed
if ! command -v jq &> /dev/null; then
    echo "Creating jq wrapper..."
    printf '#!/bin/sh\njq.exe "$@"\n' > jq
    chmod +x jq
    export PATH="$PWD:$PATH"
fi

# Ensure scripts have Unix line endings
sed -i 's/\r$//' *.sh
sed -i 's/\r$//' patches/*.patch || true

export VSCODE_QUALITY=stable

echo "Running get_repo.sh..."
./get_repo.sh

echo "Running prepare_vscode.sh..."
./prepare_vscode.sh

echo "Build preparation complete!"
