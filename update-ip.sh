#!/bin/bash

# Script to automatically update the API IP address in the mobile app
# This script gets the current machine's IP and updates the config file

echo "🔍 Getting current machine IP address..."
CURRENT_IP=$(hostname -I | awk '{print $1}')

if [ -z "$CURRENT_IP" ]; then
    echo "❌ Could not determine IP address"
    exit 1
fi

echo "📱 Current IP: $CURRENT_IP"

# Update the config file
CONFIG_FILE="src/lib/config.ts"
if [ -f "$CONFIG_FILE" ]; then
    echo "🔄 Updating $CONFIG_FILE..."
    
    # Use sed to replace the LOCAL_IP value
    sed -i "s/const LOCAL_IP = '[^']*';/const LOCAL_IP = '$CURRENT_IP';/" "$CONFIG_FILE"
    
    echo "✅ Updated LOCAL_IP to $CURRENT_IP in $CONFIG_FILE"
    echo "🚀 You can now restart the Expo development server"
else
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

echo ""
echo "📋 Next steps:"
echo "1. Restart the Expo development server: npm start"
echo "2. Reload the app on your device"
echo "3. The app should now connect to: http://$CURRENT_IP:8000"