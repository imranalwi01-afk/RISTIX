
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function run(options: { all?: boolean } = {}) {
    console.log("🧹 Cleaning frontend artifacts...");

    const cwDir = process.cwd();
    const dirsToRemove = ['.next', 'node_modules/.cache', '.swc'];

    if (options.all) {
        console.log("⚠️  Full clean requested (including node_modules)");
        dirsToRemove.push('node_modules');
        dirsToRemove.push('pnpm-lock.yaml'); // start.sh didn't do this but package.json clean-all does
    }

    for (const dir of dirsToRemove) {
        const fullPath = path.join(cwDir, dir);
        if (fs.existsSync(fullPath)) {
            console.log(`🗑️  Removing ${dir}...`);
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
    }

    console.log("✅ Cleanup complete!");
}
