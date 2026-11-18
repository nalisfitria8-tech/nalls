/**
 * Server uji LOKAL untuk Tanya Nalls (tanpa Netlify, tanpa GitHub):
 *   - menyajikan hasil build (dist/) dengan header keamanan dari netlify.toml,
 *   - meneruskan POST /.netlify/functions/tutor ke fungsi server yang sama dengan Netlify.
 * Kunci dibaca dari .env (tidak di-commit) dan tidak pernah dicetak.
 *
 *   npm run tutor:tiruan                → MODE TIRUAN: tanpa akun/kunci/internet (balasan "[Tiruan] …")
 *   npm run tutor:lokal                 → Groq sungguhan dengan kunci di .env (setelah ada izin & akun)
 *   tambahkan  -- --host                → juga bisa dibuka dari HP di Wi-Fi yang sama
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { networkInterfaces } from 'node:os';
import { loadEnv, describeEnv } from './env.mjs';
import { loadTutorFunction } from './bundle-tutor.mjs';
import { mockGroqFetch } from './mock-groq.mjs';

const root = process.cwd();
const host = process.argv.includes('--host') ? '0.0.0.0' : '127.0.0.1';
const port = Number(process.env.PORT || 8888);
const mock = process.argv.includes('--tiruan');

if (mock) {
  console.log('MODE TIRUAN: tanpa akun Groq, tanpa kunci, tanpa internet, tanpa biaya. Balasan diawali "[Tiruan]".');
} else {
  loadEnv(resolve(root, '.env'));
  console.log(describeEnv());
}
if (!existsSync(join(root, 'dist', 'index.html'))) {
  console.error('dist/ belum ada. Jalankan: npm run build');
  process.exit(1);
}

const fn = await loadTutorFunction(root);
// mode tiruan: fungsi & penjaga yang sama, hanya panggilan ke Groq diganti tiruan (kunci palsu tidak pernah dikirim ke mana pun)
const MOCK_ENV = { TUTOR_ENABLED: 'true', GROQ_API_KEY: 'tiruan' };
const handler = mock
  ? async (request) => {
      if (request.method !== 'POST') return fn.default(request);
      let body;
      try {
        body = JSON.parse(await request.text());
      } catch {
        return new Response(JSON.stringify({ status: 'invalid' }), { status: 400 });
      }
      const out = await fn.handleTutor(body, { env: MOCK_ENV, fetchImpl: mockGroqFetch });
      return new Response(JSON.stringify(out.body), { status: out.httpStatus, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
    }
  : fn.default;
const toml = readFileSync(join(root, 'netlify.toml'), 'utf8');
const headers = Object.fromEntries([...(toml.split('[headers.values]')[1] ?? '').matchAll(/^\s*([A-Za-z-]+)\s*=\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/.netlify/functions/tutor') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(`http://localhost${url.pathname}`, {
      method: req.method,
      headers: { 'content-type': req.headers['content-type'] ?? '' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
    });
    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    const body = await response.text();
    console.log(`${new Date().toLocaleTimeString()} tutor → ${response.status} ${JSON.parse(body).status}`); // status saja, bukan isi
    return res.end(body);
  }
  let file = join(root, 'dist', decodeURIComponent(url.pathname));
  if (!file.startsWith(join(root, 'dist')) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'dist', 'index.html');
  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(port, host, () => {
  console.log(`Nalls + Tanya Nalls: http://localhost:${port}`);
  if (host === '0.0.0.0') {
    for (const list of Object.values(networkInterfaces())) {
      for (const a of list ?? []) if (a.family === 'IPv4' && !a.internal) console.log(`  dari HP (Wi-Fi sama): http://${a.address}:${port}`);
    }
  }
  console.log('Coba soal terbimbing, misal: /#/soal/M3/2 · Hentikan dengan Ctrl+C');
});
