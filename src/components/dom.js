/**
 * Pembantu kecil untuk membuat elemen DOM tanpa framework.
 * h('p', { class: 'note' }, 'teks', anakLain)
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') {
      el.innerHTML = value; // hanya untuk teks yang sudah di-escape (lihat richText)
    } else {
      el.setAttribute(key, value === true ? '' : value);
    }
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/**
 * Mengganti isi elemen. Berbeda dengan el.replaceChildren(), anak null/false
 * dilewati (replaceChildren mengubah null menjadi teks "null").
 */
export function fill(el, ...children) {
  el.replaceChildren(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Markah sederhana untuk teks konten:
 *   **tebal**        → <strong>
 *   [[senilai]]      → label "↑↑ Senilai"
 *   [[berbalik]]     → label "↑↓ Berbalik nilai"
 */
export function richText(text) {
  const safe = escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[senilai\]\]/g, '<span class="tag senilai">↑↑ Senilai</span>')
    .replace(/\[\[berbalik\]\]/g, '<span class="tag berbalik">↑↓ Berbalik nilai</span>');
  return h('p', { html: safe });
}
