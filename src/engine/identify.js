/**
 * Soal identifikasi jenis tanpa menghitung (M2, F03).
 * Jawaban siswa: { arah: 'searah'|'berlawanan', jenis: 'senilai'|'berbalik' }
 * Umpan balik: docs/naskah-materi.md M2-08.
 */
const JENIS_LABEL = { senilai: '↑↑ senilai', berbalik: '↑↓ berbalik nilai' };
const ARAH_WORD = { searah: 'bertambah', berlawanan: 'berkurang' };

export function checkIdentify(item, response) {
  const arahOk = response?.arah === item.arah;
  const jenisOk = response?.jenis === item.jenis;
  return { correct: arahOk && jenisOk, arahOk, jenisOk, errorType: arahOk && jenisOk ? null : 'jenis' };
}

/** Teks umpan balik sesuai situasi (benar / arah salah / arah benar tapi jenis salah). */
export function identifyFeedback(item, result) {
  if (result.correct) {
    return {
      kind: 'ok',
      title: 'Tepat!',
      text: `${capitalize(item.a)} bertambah, ${item.b} ${ARAH_WORD[item.arah]}. Jadi ${JENIS_LABEL[item.jenis]}.`,
    };
  }
  if (!result.arahOk) {
    return { kind: 'err', title: 'Belum tepat.', text: `Bayangkan ${item.a} bertambah. Apa yang terjadi pada ${item.b}?` };
  }
  return {
    kind: 'err',
    title: 'Arahnya sudah benar.',
    text: `Jika ${item.b} ${ARAH_WORD[item.arah]}, jenisnya ${JENIS_LABEL[item.jenis]}.`,
  };
}

/** Pembahasan singkat setelah terlalu sering salah. */
export function identifySolution(item) {
  return `${capitalize(item.a)} bertambah, ${item.b} ${ARAH_WORD[item.arah]} (${item.condition}). Jadi ${JENIS_LABEL[item.jenis]}.`;
}

/**
 * Pola umpan balik umum (naskah "Pola umpan balik umum"):
 * salah ke-1 → coba lagi; ke-2 → T1; ke-3 → T2; ke-4 → pembahasan.
 */
export function identifyHintLevel(wrongCount, available) {
  return Math.min(Math.max(wrongCount - 1, 0), available);
}
export const identifyShowSolution = (wrongCount) => wrongCount >= 4;

/* Skor cek dan batas lulus: lihat scoreAnswers() di engine/attempts.js. */

/** Mengacak urutan (Fisher–Yates); rnd bisa diganti saat tes. */
export function shuffled(list, rnd = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
