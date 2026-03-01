#!/bin/bash

# Script to package Lambda functions for deployment

set -e

echo "Packaging Lambda functions..."

# Create lambda directory if it doesn't exist
mkdir -p lambda

# Package auth Lambda
echo "Packaging auth Lambda..."
cd lambda/auth
npm install --production 2>/dev/null || true
zip -r ../auth.zip . -x "*.test.ts" "*.spec.ts" "__tests__/*"
cd ../..

# Package recommendations Lambda
echo "Packaging recommendations Lambda..."
cd lambda/recommendations
npm install --production 2>/dev/null || true
zip -r ../recommendations.zip . -x "*.test.ts" "*.spec.ts" "__tests__/*"
cd ../..

echo "Lambda functions packaged successfully!"
echo "Files created:"
echo "  - lambda/auth.zip"
echo "  - lambda/recommendations.zip"
