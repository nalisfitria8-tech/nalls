import { h } from './dom.js';

/**
 * Bilah navigasi bawah: Kembali · Ulangi · Lanjut (F06).
 * Tidak ada perpindahan otomatis; siswa yang mengatur tempo (EL01, EL04).
 */
export function navBar({ onBack, onRepeat, onNext, canBack = true, nextLabel = 'Lanjut' }) {
  return h(
    'nav',
    { class: 'navbar', 'aria-label': 'Navigasi layar' },
    h('button', { type: 'button', onClick: onBack, disabled: !canBack }, 'Kembali'),
    h('button', { type: 'button', onClick: onRepeat, title: 'Ulangi penjelasan dari awal modul' }, 'Ulangi'),
    h('button', { type: 'button', class: 'primary', onClick: onNext }, nextLabel),
  );
}
