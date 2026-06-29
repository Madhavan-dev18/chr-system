import { exec } from 'child_process';
import http from 'http';

const server = exec('npm run dev -w apps/web', { cwd: 'm:/Personal/Workspace/chr-system' });

server.stdout.on('data', (data) => {
  console.log('[DEV SERVER]', data.toString());
  if (data.includes('Ready') || data.includes('started server')) {
    setTimeout(() => {
      http.get('http://localhost:3000/404', (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          // Extract the unminified error from the Next.js dev overlay or console
          console.log('[RESPONSE]', body.substring(0, 1000));
        });
      });
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.error('[DEV ERROR]', data.toString());
});

setTimeout(() => {
  server.kill();
  process.exit(0);
}, 15000);
