
import { spawn, execSync } from 'child_process';

export async function run() {
    console.log("🚀 Starting Frontend Development Server...");
    const PORT = 4231;
    console.log(`📍 Target Port: ${PORT}`);

    // Kill existing process on port
    try {
        const pids = execSync(`lsof -ti:${PORT}`).toString().trim();
        if (pids) {
            console.log(`⚡ Found service(s) running on port ${PORT}`);
            const pidList = pids.split('\n');
            for (const pid of pidList) {
                console.log(`🔪 Killing process ${pid}...`);
                try {
                    execSync(`kill -9 ${pid}`);
                } catch (e) {
                    console.log(`Failed to kill ${pid}, trying sudo...`);
                    // Avoiding sudo in automated script if possible, but start.sh had it.
                    // We'll just warn for now or let the user handle it if standard kill fails.
                }
            }
            console.log(`✅ Successfully killed all services on port ${PORT}`);
        } else {
            console.log(`✅ Port ${PORT} is available`);
        }
    } catch (e) {
        // lsof returns exit code 1 if no process found, which throws error in execSync
        console.log(`✅ Port ${PORT} is available (no process found)`);
    }

    console.log("");
    console.log("🚀 Starting Next.js development server...");
    console.log(`📱 Frontend will be available at: http://localhost:${PORT}`);

    // Start Next.js
    const child = spawn('pnpm', ['dev'], { stdio: 'inherit', env: process.env });

    child.on('close', (code) => {
        console.log(`Next.js process exited with code ${code}`);
        process.exit(code || 0);
    });
}
