import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface BuildResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export function triggerBlogBuild(): Promise<BuildResult> {
  return new Promise((resolve) => {
    const buildScript = path.join(__dirname, '../../scripts/build-blog.ts');
    
    const child = spawn('npx', ['tsx', buildScript], {
      cwd: path.join(__dirname, '../..'),
      stdio: 'pipe',
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      resolve({
        success: code === 0,
        stdout,
        stderr,
        exitCode: code,
      });
    });
    
    child.on('error', (err) => {
      resolve({
        success: false,
        stdout,
        stderr: err.message,
        exitCode: null,
      });
    });
  });
}
