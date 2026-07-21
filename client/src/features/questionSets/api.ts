import { apiClient } from "../../lib/apiClient";
import type {
  CreateQuestionSetInput,
  QuestionSet,
  QuestionSetDetail,
  QuestionSetSummary,
} from "./types";

export async function fetchQuestionSets(filters: {
  chapterId?: number;
  subjectId?: number;
  courseId?: number;
}): Promise<QuestionSet[]> {
  const { data } = await apiClient.get<{ questionSets: QuestionSet[] }>("/question-sets", {
    params: filters,
  });
  return data.questionSets;
}

export async function fetchQuestionSetForAdmin(id: number): Promise<QuestionSetDetail> {
  const { data } = await apiClient.get<{ questionSet: QuestionSetDetail }>(`/question-sets/${id}`);
  return data.questionSet;
}

export async function fetchQuestionSetSummary(id: number): Promise<QuestionSetSummary> {
  const { data } = await apiClient.get<{ questionSet: QuestionSetSummary }>(
    `/question-sets/${id}/summary`
  );
  return data.questionSet;
}

export async function createQuestionSet(input: CreateQuestionSetInput): Promise<QuestionSet> {
  const { data } = await apiClient.post<{ questionSet: QuestionSet }>("/question-sets", input);
  return data.questionSet;
}

export async function updateQuestionSet(
  id: number,
  input: Partial<CreateQuestionSetInput>
): Promise<QuestionSet> {
  const { data } = await apiClient.put<{ questionSet: QuestionSet }>(
    `/question-sets/${id}`,
    input
  );
  return data.questionSet;
}

export async function deleteQuestionSet(id: number): Promise<void> {
  await apiClient.delete(`/question-sets/${id}`);
}

export async function setQuestionSetItems(
  id: number,
  questionIds: number[]
): Promise<QuestionSetDetail> {
  const { data } = await apiClient.put<{ questionSet: QuestionSetDetail }>(
    `/question-sets/${id}/items`,
    { questionIds }
  );
  return data.questionSet;
}
