/**
 * Resolves symlinks in the Next.js build output directory.
 * Cloudflare Pages rejects deployments with broken symlinks.
 */
import { readdirSync, statSync } from 'fs';
import { copyFileSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';

function resolveSymlinks(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isSymbolicLink()) {
      const stats = statSync(fullPath);
      if (stats.isFile()) {
        const targetPath = fullPath;
        const realPath = dirname(targetPath);
        const tempPath = targetPath + '.resolved';
        // Read the symlink target and copy the real file
        const symlinkTarget = readdirSync(dirname(targetPath), { withFileTypes: true })
          .find(e => e.name === entry.name && e.isSymbolicLink());
        if (symlinkTarget) {
          const actualTarget = readdirSync(dir, { withFileTypes: true })
            .find(e => e.name === entry.name && e.isSymbolicLink());
          if (actualTarget) {
            const linkTarget = statSync(fullPath);
            copyFileSync(targetPath, tempPath);
            unlinkSync(targetPath);
            copyFileSync(tempPath, targetPath);
            unlinkSync(tempPath);
            console.log(`Resolved symlink: ${targetPath}`);
          }
        }
      }
    } else if (entry.isDirectory()) {
      resolveSymlinks(fullPath);
    }
  }
}

const buildDir = join(process.cwd(), '.next');
if (existsSync(buildDir)) {
  console.log('Resolving symlinks in .next directory...');
  resolveSymlinks(buildDir);
  console.log('Symlinks resolved successfully.');
} else {
  console.log('.next directory not found, skipping symlink resolution.');
}