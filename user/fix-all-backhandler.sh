#!/bin/bash

# Find all files with BackHandler.removeEventListener
files=$(grep -l "BackHandler\.removeEventListener" ./screens/**/*.js 2>/dev/null || true)

for file in $files; do
  echo "Fixing $file"
  # Create backup
  cp "$file" "$file.backup"
  
  # Fix the pattern: store subscription and use remove()
  sed -i.tmp 's/BackHandler\.addEventListener("hardwareBackPress", \([^)]*\));/const subscription = BackHandler.addEventListener("hardwareBackPress", \1);/g' "$file"
  sed -i.tmp 's/BackHandler\.removeEventListener("hardwareBackPress", \([^)]*\));/subscription?.remove();/g' "$file"
  
  # Clean up temp files
  rm -f "$file.tmp"
done

echo "All BackHandler fixes completed!"
