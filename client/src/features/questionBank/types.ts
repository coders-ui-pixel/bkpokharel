export type CorrectOption = "A" | "B" | "C" | "D";
export type Difficulty = "easy" | "medium" | "hard" | "mixed";

export interface Question {
  id: number;
  chapterId: number | null;
  subjectId: number | null;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: CorrectOption;
  marks: string;
  difficulty: Difficulty | null;
  tags: string | null;
  explanation: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateQuestionInput {
  chapterId?: number;
  subjectId?: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: CorrectOption;
  marks: number;
  difficulty?: Difficulty;
  explanation?: string;
}

export type UpdateQuestionInput = Partial<CreateQuestionInput>;

export interface CsvValidRow {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: CorrectOption;
  marks: number;
  difficulty?: Difficulty;
  tags?: string[];
  explanation?: string;
}

export interface CsvDryRunResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  invalidRows: { row: number; error?: string }[];
  validRows: CsvValidRow[];
}
