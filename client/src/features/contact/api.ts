import { apiClient } from "../../lib/apiClient";

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export async function sendContactMessage(input: ContactInput): Promise<void> {
  await apiClient.post("/contact", input);
}
