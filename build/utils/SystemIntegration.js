import { exec } from 'child_process';
import { promisify } from 'util';
export class SystemIntegration {
    static async openInBrowser(url) {
        const cmd = process.platform === 'win32' ? 'start' :
            process.platform === 'darwin' ? 'open' :
                'xdg-open';
        await this.execAsync(`${cmd} "${url}"`);
    }
}
SystemIntegration.execAsync = promisify(exec);
