// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pendingEvents, clearEvents } from '../src/data/logger.js';
import m2 from '../src/content/m2.json';
import { lessonScreen } from '../src/screens/lesson.js';
import { relationTable } from '../src/components/relationTable.js';
import { richText } from '../src/components/dom.js';

function mount(nodes) {
  const root = document.createElement('div');
  root.append(...nodes);
  return root;
}

describe('layar materi M2', () => {
  for (let i = 0; i < m2.screens.length; i++) {
    const s = m2.screens[i];
    it(`${s.id} tampil dengan navigasi Kembali · Ulangi · Lanjut`, () => {
      const root = mount(lessonScreen({ lesson: m2, index: i, go: () => {} }));
      const labels = [...root.querySelectorAll('.navbar button')].map((b) => b.textContent);
      // layar terakhir M2 tetap "Lanjut" karena berlanjut ke latihan identifikasi
      expect(labels).toEqual(['Kembali', 'Ulangi', 'Lanjut']);
      expect(root.querySelector('.progress').textContent).toBe(`${i + 1}/${m2.screens.length}`);
      expect(root.querySelectorAll('table').length).toBe(s.tables?.length || 0);
    });
  }

  it('layar pertama: tombol Kembali nonaktif', () => {
    const root = mount(lessonScreen({ lesson: m2, index: 0, go: () => {} }));
    expect(root.querySelector('.navbar button').disabled).toBe(true);
  });

  it('Ulangi kembali ke layar pertama modul, Lanjut ke layar berikut', () => {
    const go = vi.fn();
    const root = mount(lessonScreen({ lesson: m2, index: 3, go }));
    const [, ulangi, lanjut] = root.querySelectorAll('.navbar button');
    ulangi.click();
    lanjut.click();
    expect(go.mock.calls).toEqual([['#/modul/M2/0'], ['#/modul/M2/4']]);
  });

  it('M2-06 menampilkan dua tabel berdampingan', () => {
    const idx = m2.screens.findIndex((s) => s.id === 'M2-06');
    const root = mount(lessonScreen({ lesson: m2, index: idx, go: () => {} }));
    expect(root.querySelector('.tables').classList.contains('pair')).toBe(true);
  });
});

describe('M2-06: mengetuk label tabel dan "yang tetap" (temuan B)', () => {
  const idx = m2.screens.findIndex((s) => s.id === 'M2-06');
  const screen = m2.screens[idx];
  const cols = (root) => [...root.querySelectorAll('.label-col')];
  const btn = (el, text) => [...el.querySelectorAll('button')].find((b) => b.textContent.trim() === text);

  beforeEach(() => clearEvents());

  it('awalnya: dua tabel, label jenis di bawah tiap tabel, keterangan jenis belum tampil', () => {
    const root = mount(lessonScreen({ lesson: m2, index: idx, go: () => {} }));
    expect(cols(root)).toHaveLength(2);
    expect(root.textContent).toContain(screen.interaction.prompt);
    // isi layar harus menjadi elemen <p>, bukan teks hasil mengubah array/elemen menjadi string
    const paragraphs = [...root.querySelectorAll('main > p')].map((p) => p.textContent);
    expect(paragraphs.slice(0, 3)).toEqual(['Bandingkan kedua tabel.', 'Jika yang satu bertambah, yang lain bertambah atau berkurang?', screen.interaction.prompt]);
    expect([...root.querySelector('main').childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).toBe(false);
    expect(root.textContent).not.toContain('SENILAI ↑↑'); // tidak memberi jawaban lebih dulu
    expect(root.querySelectorAll('caption')).toHaveLength(0);
    for (const c of cols(root)) {
      expect(btn(c, '↑↑ Senilai')).toBeDefined();
      expect(btn(c, '↑↓ Berbalik nilai')).toBeDefined();
      expect(c.textContent).not.toContain(screen.interaction.constantQuestion);
    }
    // navigasi tetap tersedia (siswa mengatur tempo, F06)
    expect([...root.querySelectorAll('.navbar button')].map((b) => b.textContent)).toEqual(['Kembali', 'Ulangi', 'Lanjut']);
  });

  it('label salah → umpan balik mengarahkan tanpa memberi jawaban; bisa dicoba lagi', () => {
    const root = mount(lessonScreen({ lesson: m2, index: idx, go: () => {} }));
    const [kiri] = cols(root);
    btn(kiri, '↑↓ Berbalik nilai').click();
    expect(kiri.querySelector('.feedback.err').textContent).toBe(screen.interaction.feedback.jenisErr);
    expect(kiri.textContent).not.toContain('SENILAI');
    btn(kiri, '↑↑ Senilai').click();
    expect(kiri.querySelector('.feedback.ok')).not.toBeNull();
  });

  it('jalur benar: senilai → hasil bagi, berbalik → hasil kali; keterangan muncul dan tercatat', () => {
    const root = mount(lessonScreen({ lesson: m2, index: idx, go: () => {} }));
    const [kiri, kanan] = cols(root);
    btn(kiri, '↑↑ Senilai').click();
    expect(kiri.textContent).toContain('SENILAI ↑↑');
    expect(kiri.textContent).toContain('Yang tetap: hasil bagi atau hasil kali?');
    expect(btn(kiri, '↑↑ Senilai').disabled).toBe(true);
    btn(kiri, 'hasil kali').click();
    expect(kiri.querySelector('.feedback.err:last-child').textContent).toBe(screen.interaction.feedback.tetapErr);
    btn(kiri, 'hasil bagi').click();
    expect(btn(kiri, 'hasil bagi').disabled).toBe(true);

    btn(kanan, '↑↓ Berbalik nilai').click();
    expect(kanan.textContent).toContain('BERBALIK ↑↓');
    btn(kanan, 'hasil kali').click();
    expect(kanan.querySelectorAll('.feedback.ok')).toHaveLength(2);

    const rows = pendingEvents().filter((e) => e.row.type === 'screen_check').map((e) => e.row);
    expect(rows.every((r) => r.module_id === 'M2' && r.screen_id === 'M2-06')).toBe(true);
    expect(rows.map((r) => [r.payload.table, r.payload.question, r.payload.response, r.payload.correct])).toEqual([
      [0, 'jenis', 'senilai', true],
      [0, 'tetap', 'hasil kali', false],
      [0, 'tetap', 'hasil bagi', true],
      [1, 'jenis', 'berbalik', true],
      [1, 'tetap', 'hasil kali', true],
    ]);
  });

  it('isi materi M2-06 tidak berubah (teks, tabel, keterangan)', () => {
    expect(screen.text).toEqual(['Bandingkan kedua tabel.']);
    expect(screen.after).toEqual(['Jika yang satu bertambah, yang lain **bertambah** atau **berkurang**?']);
    expect(screen.tables.map((t) => t.caption)).toEqual(['SENILAI ↑↑', 'BERBALIK ↑↓']);
    expect(screen.tables.map((t) => t.rows)).toEqual([[[2, 8000], [4, 16000]], [[2, 12], [4, 6]]]);
  });
});

describe('komponen', () => {
  it('tabel hubungan: angka ribuan bertitik dan sel ditanya "?"', () => {
    const t = relationTable({ columns: [{ label: 'Buku', arrow: '↑' }, { label: 'Harga' }], rows: [[3, 12000], [5, null]] });
    const cells = [...t.querySelectorAll('td')].map((c) => c.textContent);
    expect(cells).toEqual(['3', '12.000', '5', '?']);
    expect(t.querySelector('th').textContent).toBe('Buku ↑');
  });

  it('richText: tebal dan label jenis, tanpa menyisipkan HTML berbahaya', () => {
    const p = richText('**Senilai** [[senilai]] <img src=x onerror=alert(1)>');
    expect(p.querySelector('strong').textContent).toBe('Senilai');
    expect(p.querySelector('.tag.senilai').textContent).toBe('↑↑ Senilai');
    expect(p.querySelector('img')).toBeNull();
  });
});
