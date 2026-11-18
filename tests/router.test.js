// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from 'vitest';
import { store } from '../src/data/store.js';

const app = () => document.getElementById('app');
const title = () => app().querySelector('h1')?.textContent;

async function visit(hash) {
  location.hash = hash;
  window.dispatchEvent(new Event('hashchange'));
}

beforeAll(async () => {
  document.body.innerHTML = '<div id="app"></div>';
  store.reset();
  store.update((s) => {
    s.grade = 8;
    s.diagnostic.done = true;
    s.diagnostic.start = 'M2';
  });
  await import('../src/main.js');
});

describe('rute M2 dan gerbang DS02 (main.js)', () => {
  it('kelas VIII: M2 dari peta belajar → tawaran cek cepat', async () => {
    await visit('#/');
    [...app().querySelectorAll('button.module')].find((b) => b.textContent.startsWith('M2')).click();
    window.dispatchEvent(new Event('hashchange'));
    expect(location.hash).toBe('#/m2/tawar');
    expect(app().textContent).toContain('Mau coba cek cepat 5 soal?');
  });

  it('setiap bagian M2 punya layar', async () => {
    await visit('#/m2/cepat/0');
    expect(title()).toBe('Cek cepat');
    await visit('#/m2/latih/2');
    expect(app().querySelector('.progress').textContent).toBe('3/5');
    await visit('#/m2/cek/mulai');
    expect(app().textContent).toContain('cek pemahamanmu');
  });

  it('"jelaskan" tidak bisa dibuka sebelum lulus cek', async () => {
    store.update((s) => (s.m2.passed = false));
    await visit('#/m2/jelaskan');
    expect(title()).toBe('Nalls');
  });

  it('layar M2-07 → latihan identifikasi', async () => {
    await visit('#/modul/M2/6');
    [...app().querySelectorAll('.navbar button')].find((b) => b.textContent === 'Lanjut').click();
    expect(location.hash).toBe('#/m2/latih/0');
  });

  it('soal mandiri M3 terkunci sebelum lulus, terbuka sesudahnya', async () => {
    const { default: m3 } = await import('../src/content/m3.json');
    const idx = m3.items.findIndex((i) => i.phase === 'mandiri');
    store.update((s) => (s.m2.passed = false));
    await visit(`#/soal/M3/${idx}`);
    expect(app().textContent).toContain('Latihan mandiri terbuka setelah');
    store.update((s) => (s.m2.passed = true));
    await visit(`#/soal/M3/${idx + 1}`);
    expect(app().textContent).not.toContain('Latihan mandiri terbuka setelah');
    expect(app().querySelector('.steps')).not.toBeNull();
  });
});

describe('tombol Kembali browser di cek pemahaman (temuan A, lewat router)', () => {
  const click = (text) => [...app().querySelectorAll('button')].find((b) => b.textContent.trim() === text).click();

  it('jawaban yang sudah dikirim tidak bisa diubah setelah kembali ke soal itu', async () => {
    store.reset();
    store.update((s) => {
      s.grade = 7;
      s.diagnostic.done = true;
    });
    await visit('#/m2/cek/mulai');
    click('Mulai');
    window.dispatchEvent(new Event('hashchange'));
    expect(location.hash).toBe('#/m2/cek/0');
    click('berkurang'); // C1 sebenarnya searah → salah
    click('↑↓ Berbalik nilai');
    click('Periksa');
    click('Lanjut');
    window.dispatchEvent(new Event('hashchange'));
    expect(location.hash).toBe('#/m2/cek/1');

    await visit('#/m2/cek/0'); // = tombol Kembali
    expect([...app().querySelectorAll('button')].some((b) => b.textContent.trim() === 'Periksa')).toBe(false);
    expect(app().querySelector('.saved-answer').textContent).toContain('berkurang');
    expect(store.get().m2.cek.answers.C1.correct).toBe(false);
  });
});

describe('M4 terdaftar di router (main.js)', () => {
  it('layar materi M4 dan soal M4 bisa dibuka; soal mandiri M4 mengikuti gerbang DS02', async () => {
    const { default: m4 } = await import('../src/content/m4.json');
    store.reset();
    store.update((s) => {
      s.grade = 7;
      s.diagnostic.done = true;
      s.progress = { M1: 'selesai', M2: 'selesai', M3: 'selesai' };
    });
    await visit('#/modul/M4/0');
    expect(title()).toBe('Menghitung Berbalik Nilai');
    await visit('#/soal/M4/2');
    expect(app().textContent).toContain('Suatu pekerjaan selesai dalam 15 hari');

    const idx = m4.items.findIndex((i) => i.id === 'M4-M1');
    store.update((s) => (s.m2.passed = false));
    await visit(`#/soal/M4/${idx}`);
    expect(app().textContent).toContain('Latihan mandiri terbuka setelah');
    store.update((s) => (s.m2.passed = true));
    await visit(`#/soal/M4/${idx}`);
    expect(app().textContent).toContain('Rumah selesai dibangun 12 tukang');
  });

  it('peta belajar: M4 tidak lagi "Segera hadir"', async () => {
    await visit('#/');
    const m4btn = [...app().querySelectorAll('button.module')].find((b) => b.textContent.startsWith('M4'));
    expect(m4btn.textContent).not.toContain('Segera hadir');
    expect(m4btn.disabled).toBe(false);
  });
});

describe('Tes literasi terdaftar di router (main.js)', () => {
  it('alamat tes awal, soal, periksa, hasil, dan penilai bisa dibuka', async () => {
    store.reset();
    store.update((s) => {
      s.grade = 7;
      s.diagnostic.done = true;
    });
    await visit('#/tes-ml/awal');
    expect(title()).toBe('Tes awal');
    [...app().querySelectorAll('button')].find((b) => b.textContent === 'Mulai').click();
    window.dispatchEvent(new Event('hashchange'));
    expect(location.hash).toBe('#/tes-ml/awal/0');
    expect(app().querySelector('textarea')).not.toBeNull();
    await visit('#/tes-ml/awal/3');
    expect(app().querySelector('.progress').textContent).toBe('Soal 4/4');
    await visit('#/tes-ml/awal/kirim');
    expect(app().textContent).toContain('Periksa lagi jawaban uraianmu');
    // PG lewat alamat langsung sebelum uraian dikirim → kembali ke uraian, tanpa opsi PG
    for (const hash of ['#/tes-ml/awal/pg', '#/tes-ml/awal/pg/2', '#/tes-ml/awal/pg/kirim']) {
      await visit(hash);
      expect(app().querySelector('label.ml-mcq-option'), hash).toBeNull();
      expect(app().querySelector('textarea'), hash).not.toBeNull();
    }
    await visit('#/tes-ml/awal/hasil'); // hasil sebelum dikirim → pengantar, tanpa opsi PG
    expect(app().querySelector('label.ml-mcq-option')).toBeNull();
    expect(app().textContent).not.toContain('Jawabanmu sudah terkirim');
    await visit('#/tes-ml/awal/0');
    // kirim uraian → pengantar PG → PG 1..4 → periksa PG
    app().querySelector('textarea').value = 'jawaban';
    app().querySelector('textarea').dispatchEvent(new Event('input'));
    await visit('#/tes-ml/awal/kirim');
    [...app().querySelectorAll('button')].find((b) => b.textContent === 'Kirim jawaban').click();
    [...app().querySelectorAll('button')].find((b) => b.textContent === 'Ya, kirim').click();
    window.dispatchEvent(new Event('hashchange'));
    expect(location.hash).toBe('#/tes-ml/awal/pg');
    expect(app().textContent).toContain('Sekarang kerjakan 4 soal pilihan ganda');
    await visit('#/tes-ml/awal/pg/3');
    expect(app().querySelector('.progress').textContent).toBe('Pilihan ganda 4/4');
    expect(app().querySelectorAll('label.ml-mcq-option')).toHaveLength(4);
    await visit('#/tes-ml/awal/pg/9');
    expect(app().querySelector('.progress').textContent).toBe('Pilihan ganda 4/4'); // nomor dibatasi
    await visit('#/tes-ml/awal/pg/kirim');
    expect(app().textContent).toContain('Periksa lagi pilihanmu');
    await visit('#/tes-ml/akhir');
    expect(app().textContent).toContain('Kerjakan tes awal dulu'); // PG tes awal belum dikirim
    await visit('#/tes-ml/penilai');
    expect(title()).toBe('Penilaian tes literasi');
    await visit('#/tes-ml/penilai/awal/0');
    expect(app().querySelector('.ml-student-answer').textContent).toBe('jawaban'); // uraian sudah bisa dinilai
    await visit('#/tes-ml/penilai/akhir/0');
    expect(app().textContent).toContain('Tes akhir belum dikirim siswa');
    await visit('#/tes-ml/salah');
    expect(title()).toBe('Nalls'); // fase tidak dikenal → peta belajar
  });
});

describe('siswa baru: setelah memilih kelas ke peta belajar (Tes awal sebelum M0)', () => {
  it('memilih kelas → peta belajar dengan Tes awal di atas dan M0 tetap bisa dibuka', async () => {
    store.reset();
    await visit('#/');
    [...app().querySelectorAll('button')].find((b) => b.textContent === 'Kelas VII').click();
    window.dispatchEvent(new Event('hashchange'));
    expect(title()).toBe('Nalls');
    expect(app().textContent).toContain('Kerjakan Tes awal sebelum mulai belajar.');
    const modules = [...app().querySelectorAll('button.module')].map((b) => b.textContent);
    expect(modules[0]).toContain('Tes awal');
    const m0 = [...app().querySelectorAll('button.module')].find((b) => b.textContent.startsWith('M0'));
    expect(m0.disabled).toBe(false);
  });
});
