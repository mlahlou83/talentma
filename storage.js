const PREFIX = 'talentma_'

export async function load(key) {
  try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : null; } catch { return null; }
}
export async function save(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
}
export async function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch {}
}
