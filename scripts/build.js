'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = process.argv[2] || 'chrome';
if (!['chrome', 'firefox'].includes(target)) throw new Error(`Unknown build target: ${target}. Use chrome or firefox.`);
const out = path.join(root, 'dist', target);
function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => {
    const index = line.indexOf('=');
    if (index < 0) return [line, ''];
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [line.slice(0, index).trim(), value];
  }));
}
const env = { ...readEnv(path.join(root, '.env')), ...process.env };
const apiKey = (env.DEEPSEEK_API_KEY || '').trim();
if (!apiKey) {
  console.error('DEEPSEEK_API_KEY is not configured.\nPlease add your DeepSeek API key to .env.');
  process.exit(1);
}
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const entry of ['src']) fs.cpSync(path.join(root, entry), path.join(out, entry), { recursive: true });
const manifestName = target === 'firefox' ? 'manifest.firefox.json' : 'manifest.json';
fs.copyFileSync(path.join(root, manifestName), path.join(out, 'manifest.json'));
const baseUrl = (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').trim().replace(/\/+$/, '');
let apiUrl;
try {
  apiUrl = new URL(baseUrl);
} catch {
  console.error('DEEPSEEK_BASE_URL must be a valid HTTPS URL.');
  process.exit(1);
}
if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
  console.error('DEEPSEEK_BASE_URL must be an HTTPS URL without credentials, query, or fragment.');
  process.exit(1);
}
const config = { apiKey, baseUrl, model: env.DEEPSEEK_MODEL || 'deepseek-chat' };
const manifestPath = path.join(out, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.host_permissions = [`${apiUrl.origin}/*`];
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(out, 'config.js'), `'use strict';\nglobalThis.EN2EN_CONFIG = ${JSON.stringify(config)};\n`, { mode: 0o600 });
console.log(`Built En2En ${target} extension in ${path.relative(root, out)}/.`);
