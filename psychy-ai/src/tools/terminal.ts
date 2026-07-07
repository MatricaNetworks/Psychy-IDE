import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class TerminalTools {
  static async runCommand(command: string, cwd?: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd: cwd || process.cwd(), timeout: 30000 });
      return `STDOUT:\n${stdout}\nSTDERR:\n${stderr}`;
    } catch (error: any) {
      throw new Error(`Command failed: ${error.message}\nSTDOUT:\n${error.stdout}\nSTDERR:\n${error.stderr}`);
    }
  }
}
