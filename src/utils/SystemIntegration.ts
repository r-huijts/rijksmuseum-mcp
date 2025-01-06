import { exec } from 'child_process';
import { promisify } from 'util';

export class SystemIntegration {
  private static execAsync = promisify(exec);

  static async openInBrowser(url: string): Promise<void> {
    const cmd = process.platform === 'win32' ? 'start' :
                process.platform === 'darwin' ? 'open' :
                'xdg-open';
    
    await this.execAsync(`${cmd} "${url}"`);
  }
} 