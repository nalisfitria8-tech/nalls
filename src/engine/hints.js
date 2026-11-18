/**
 * Petunjuk bertingkat dan pengurangan bertahap (F08, GL03).
 * Petunjuk tidak pernah memberi jawaban akhir.
 */

/** Tingkat petunjuk maksimum per fase (docs/naskah-materi.md, "Fase petunjuk"). */
export const MAX_HINT = { contoh: 3, setengah: 3, latihan: 3, mandiri: 2, akhir: 0 };

export function maxHintLevel(phase, available = 3) {
  return Math.min(MAX_HINT[phase] ?? 0, available);
}

/**
 * Apakah petunjuk berikutnya muncul otomatis setelah salah?
 *  - contoh/setengah: setelah salah pertama
 *  - latihan: setelah salah kedua
 *  - mandiri: setelah salah ketiga (sebelumnya hanya atas permintaan)
 *  - akhir: tidak pernah
 */
export function autoHintAfterWrong(phase, wrongCount) {
  const threshold = { contoh: 1, setengah: 1, latihan: 2, mandiri: 3 }[phase];
  return threshold !== undefined && wrongCount >= threshold;
}

/**
 * Pembahasan lengkap ditampilkan setelah 2 kali salah ketika petunjuk
 * sudah di tingkat maksimum.
 */
export function shouldShowSolution(phase, hintLevel, wrongAtMax) {
  const max = maxHintLevel(phase);
  return max > 0 && hintLevel >= max && wrongAtMax >= 2;
}

/**
 * Mencatat satu jawaban salah dan menghitung keadaan petunjuk berikutnya.
 * s = { hint, wrong, wrongAtMax } → keadaan baru + showSolution
 */
export function registerWrong(phase, s, available = 3) {
  const max = maxHintLevel(phase, available);
  const wrong = s.wrong + 1;
  const wrongAtMax = s.hint >= max && max > 0 ? s.wrongAtMax + 1 : s.wrongAtMax;
  const hint = s.hint < max && autoHintAfterWrong(phase, wrong) ? s.hint + 1 : s.hint;
  return { hint, wrong, wrongAtMax, showSolution: shouldShowSolution(phase, hint, wrongAtMax) };
}
