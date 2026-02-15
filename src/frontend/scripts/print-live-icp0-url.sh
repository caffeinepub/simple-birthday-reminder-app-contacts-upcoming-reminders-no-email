#!/bin/bash

# Birthday Buddy - Live URL Extraction Script
# This script extracts the frontend canister ID and prints the live icp0.io URL

set -e

echo "=========================================="
echo "Birthday Buddy - Live Deployment URL"
echo "=========================================="
echo ""

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo "❌ Error: dfx command not found"
    echo "Please install the DFX CLI: https://internetcomputer.org/docs/current/developer-docs/setup/install"
    exit 1
fi

# Try to get the frontend canister ID from the IC network
echo "🔍 Fetching frontend canister ID..."
echo ""

CANISTER_ID=$(dfx canister --network ic id frontend 2>/dev/null || echo "")

if [ -z "$CANISTER_ID" ]; then
    echo "❌ Error: Could not retrieve frontend canister ID"
    echo ""
    echo "This usually means:"
    echo "  1. The application hasn't been deployed to the IC network yet"
    echo "  2. You need to run: dfx deploy --network ic"
    echo ""
    echo "To deploy your application:"
    echo "  cd <project-root>"
    echo "  dfx deploy --network ic"
    exit 1
fi

# Print the results
echo "✅ Frontend Canister ID:"
echo "   $CANISTER_ID"
echo ""
echo "🌐 Live URLs:"
echo "   https://$CANISTER_ID.icp0.io"
echo "   https://$CANISTER_ID.ic0.app (alternative)"
echo ""
echo "=========================================="
echo "📋 Share this URL with your users!"
echo "=========================================="
echo ""
echo "Note: This is your LIVE production URL on the Internet Computer."
echo "      It is NOT the same as your caffeine.xyz draft preview URL."
echo ""
