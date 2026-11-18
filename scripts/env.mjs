/**
 * Membaca .env (KUNCI=nilai) TANPA menimpa variabel yang sudah ada dan TANPA mencetak nilainya.
 * Dipakai skrip uji lokal Tanya Nalls. File .env ada di .gitignore dan tidak pernah di-commit.
 */
import { existsSync, readFileSync } from 'node:fs';

export function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue; // komentar, baris kosong, atau format lain
    out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

export function loadEnv(path = '.env', env = process.env) {
  if (!existsSync(path)) return [];
  const vars = parseEnv(readFileSync(path, 'utf8'));
  const loaded = [];
  for (const [k, v] of Object.entries(vars)) {
    if (env[k] === undefined) {
      env[k] = v;
      loaded.push(k);
    }
  }
  return loaded;
}

/** Ringkasan aman untuk dicetak: nama variabel + "terisi"/"kosong", tidak pernah nilainya. */
export function describeEnv(env = process.env) {
  const key = env.GROQ_API_KEY ? `terisi (${env.GROQ_API_KEY.length} karakter)` : 'BELUM ADA';
  return `GROQ_API_KEY: ${key} · TUTOR_ENABLED: ${env.TUTOR_ENABLED ?? '(kosong → mati)'} · TUTOR_MODEL: ${env.TUTOR_MODEL || '(bawaan openai/gpt-oss-120b)'}`;
}
