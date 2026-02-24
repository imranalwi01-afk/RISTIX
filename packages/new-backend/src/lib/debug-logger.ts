
import * as fs from 'fs';
import * as path from 'path';

// Use an absolute path to be sure
const LOG_FILE = 'D:\\pro\\ifrs9-new\\packages\\new-backend\\runtime_debug.log';

export function debugLog(msg: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[${timestamp}] ${msg} ${args.map(a => {
        try {
            return typeof a === 'object' ? JSON.stringify(a) : String(a);
        } catch (e) {
            return '[Circular or Non-Serializable]';
        }
    }).join(' ')}\n`;
    try {
        fs.appendFileSync(LOG_FILE, formattedMsg);
    } catch (err) {
        // Ignore
    }
}
