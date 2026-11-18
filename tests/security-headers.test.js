// D1: header keamanan Netlify tidak boleh hilang atau dilonggarkan tanpa sengaja.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const toml = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
/** Membaca nilai `Nama = "nilai"` dari blok [headers.values]. */
export function headerValues(text) {
  const block = text.split('[headers.values]')[1] ?? '';
  return Object.fromEntries([...block.matchAll(/^\s*([A-Za-z-]+)\s*=\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]));
}
const headers = headerValues(toml);
const csp = Object.fromEntries((headers['Content-Security-Policy'] ?? '').split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map(([k, ...v]) => [k, v]));

describe('header keamanan (netlify.toml)', () => {
  it('berlaku untuk semua halaman', () => {
    expect(toml).toMatch(/\[\[headers\]\]\s*\n\s*for = "\/\*"/);
  });

  it('CSP ketat: hanya situs sendiri, tanpa inline/eval, tidak bisa disematkan', () => {
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['script-src']).toEqual(["'self'"]);
    expect(csp['style-src']).toEqual(["'self'"]);
    expect(csp['connect-src']).toEqual(["'self'"]); // Groq hanya dipanggil dari server
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(headers['Content-Security-Policy']).not.toMatch(/unsafe-inline|unsafe-eval|https?:|\*/);
  });

  it('header pendukung', () => {
    expect(headers).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    });
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Permissions-Policy']).toContain('microphone=()');
  });

  it('tidak ada kunci atau nilai rahasia di netlify.toml', () => {
    expect(toml).not.toMatch(/gsk_|GROQ_API_KEY\s*=|sk-|service_role/);
  });
});
