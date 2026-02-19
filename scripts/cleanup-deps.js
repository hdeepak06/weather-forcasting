import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('[v0] Cleaning up corrupted dependencies...');

// Remove node_modules
const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('[v0] Removing node_modules directory...');
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('[v0] node_modules removed');
}

// Remove package-lock.json (we'll use pnpm)
const packageLockPath = path.join(projectRoot, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  console.log('[v0] Removing package-lock.json...');
  fs.unlinkSync(packageLockPath);
  console.log('[v0] package-lock.json removed');
}

console.log('[v0] Cleanup complete. Dependencies will be reinstalled on next run.');
