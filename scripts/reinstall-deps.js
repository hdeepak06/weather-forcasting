import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

console.log('[v0] Starting dependency cleanup and reinstall...');

// Remove node_modules if it exists
const nodeModulesPath = join(projectRoot, 'node_modules');
if (existsSync(nodeModulesPath)) {
  console.log('[v0] Removing node_modules directory...');
  rmSync(nodeModulesPath, { recursive: true, force: true });
}

// Remove pnpm-lock.yaml to force a fresh lock
const pnpmLockPath = join(projectRoot, 'pnpm-lock.yaml');
if (existsSync(pnpmLockPath)) {
  console.log('[v0] Removing pnpm-lock.yaml...');
  rmSync(pnpmLockPath);
}

// Remove package-lock.json if it exists (conflicting with pnpm)
const npmLockPath = join(projectRoot, 'package-lock.json');
if (existsSync(npmLockPath)) {
  console.log('[v0] Removing package-lock.json...');
  rmSync(npmLockPath);
}

console.log('[v0] Cleanup complete. Dependencies will be reinstalled automatically.');
