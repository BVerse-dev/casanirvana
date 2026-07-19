/*
  Copies specific notification-related image assets from the user app
  into the guard app, so both use the same icons.

  Safe to run multiple times. Uses relative paths from the Guard app root.
*/
const fs = require('fs');
const path = require('path');

const guardRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const srcDir = path.resolve(guardRoot, '../../user-app/user/assets/images');
const dstDir = path.resolve(guardRoot, 'assets/images');

const files = [
  'community3.png',
  'community4.png',
  'community5.png',
  's7.png',
  'notification.png',
];

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory not found: ${srcDir}`);
  process.exitCode = 1;
  process.exit();
}

fs.mkdirSync(dstDir, { recursive: true });

let copied = 0;
for (const f of files) {
  const src = path.join(srcDir, f);
  const dst = path.join(dstDir, f);
  if (!fs.existsSync(src)) {
    console.warn(`Missing in user-app: ${f}`);
    continue;
  }
  fs.copyFileSync(src, dst);
  copied++;
  console.log(`Copied ${f}`);
}

console.log(`Done. Copied ${copied}/${files.length} files to ${dstDir}`);
