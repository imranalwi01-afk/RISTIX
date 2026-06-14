
import { spawn, execSync } from 'child_process';

export async function run() {
    const PORT = 4231;

    // Kill existing process on port
    try {
        const pids = execSync(`lsof -ti:${PORT}`).toString().trim();
        if (pids) {
            const pidList = pids.split('\n');
            for (const pid of pidList) {
                try {
                    execSync(`kill -9 ${pid}`);
                } catch (e) {
                    console.log(`Failed to kill ${pid}, trying sudo...`);
                    // Avoiding sudo in automated script if possible, but start.sh had it.
                    // We'll just warn for now or let the user handle it if standard kill fails.
                }
            }
        } else {
        }
    } catch (e) {
        // lsof returns exit code 1 if no process found, which throws error in execSync
        console.log(`✅ Port ${PORT} is available (no process found)`);
    }


    // Start Next.js
    const child = spawn('pnpm', ['dev'], { stdio: 'inherit', env: process.env });

    child.on('close', (code) => {
        process.exit(code || 0);
    });
}
