import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "mcq-selected-course-id";

interface SelectedCourseContextValue {
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number | null) => void;
}

const SelectedCourseContext = createContext<SelectedCourseContextValue | null>(null);

export function SelectedCourseProvider({ children }: { children: ReactNode }) {
  const [selectedCourseId, setSelectedCourseIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  function setSelectedCourseId(id: number | null) {
    setSelectedCourseIdState(id);
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(id));
    }
  }

  return (
    <SelectedCourseContext.Provider value={{ selectedCourseId, setSelectedCourseId }}>
      {children}
    </SelectedCourseContext.Provider>
  );
}

export function useSelectedCourse() {
  const ctx = useContext(SelectedCourseContext);
  if (!ctx) throw new Error("useSelectedCourse must be used within SelectedCourseProvider");
  return ctx;
}
