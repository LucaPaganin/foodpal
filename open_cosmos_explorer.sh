#!/bin/bash

# Create directory for certificate if it doesn't exist
mkdir -p ~/cosmos-cert

# Download the certificate from the emulator
echo "Downloading CosmosDB emulator certificate..."
curl -k https://localhost:8081/_explorer/emulator.pem -o ~/cosmos-cert/cosmosdb-emulator.crt

# Set certificate path
CERT_PATH=~/cosmos-cert/cosmosdb-emulator.crt

# Check if the certificate was downloaded successfully
if [ ! -f "$CERT_PATH" ]; then
    echo "Failed to download certificate. Make sure the CosmosDB emulator is running."
    exit 1
fi

echo "Certificate downloaded successfully to $CERT_PATH"

# Check if we're running in WSL
if grep -q Microsoft /proc/version; then
    echo "Running in WSL, launching Windows browser..."
    # Use Windows browser through WSL integration
    cmd.exe /c start https://localhost:8081/_explorer/index.html
else
    # Launch Chrome with certificate settings in Linux
    echo "Launching Chrome with certificate settings..."
    google-chrome-stable --ignore-certificate-errors \
                         --no-sandbox \
                         --user-data-dir=/tmp/cosmos-chrome \
                         https://localhost:8081/_explorer/index.html
fi

echo "When prompted, use the following credentials:"
echo "Username: localhost"
echo "Password: C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
