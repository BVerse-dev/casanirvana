#!/bin/bash

# Fix all files with the syntax error
files=$(find ./screens -name "*.js" -type f -exec grep -l "return () =>" {} \; | xargs grep -l "if (backAction)" 2>/dev/null || true)

for file in $files; do
  echo "Fixing syntax in $file"
  
  # Fix the return statement syntax - need to add braces
  sed -i.bak 's/return () =>/return () => {/' "$file"
  sed -i.bak 's/if (backAction) { const subscription = BackHandler\.addEventListener("hardwareBackPress", backAction); subscription?.remove(); }/const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); return () => subscription?.remove(); }/' "$file"
  
  # Clean up backup files
  rm -f "$file.bak"
done

echo "Syntax fixes completed!"
