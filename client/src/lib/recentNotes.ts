const STORAGE_KEY = "mcq-recent-notes";
const MAX_ENTRIES = 6;

export interface RecentNoteEntry {
  id: number;
  title: string;
  filePath: string;
  chapterId: number;
  openedAt: string;
}

export function getRecentNotes(): RecentNoteEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function recordNoteOpened(entry: Omit<RecentNoteEntry, "openedAt">) {
  const existing = getRecentNotes().filter((n) => n.id !== entry.id);
  const next = [{ ...entry, openedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function findRecentNote(id: number): RecentNoteEntry | undefined {
  return getRecentNotes().find((n) => n.id === id);
}
