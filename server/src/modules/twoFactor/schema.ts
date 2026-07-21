import { z } from "zod";

export const verifyTwoFactorSetupSchema = z.object({
  token: z.string().length(6),
});

export const disableTwoFactorSchema = z.object({
  token: z.string().length(6),
});

export const loginVerifySchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().length(6),
});

export type VerifyTwoFactorSetupInput = z.infer<typeof verifyTwoFactorSetupSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;
export type LoginVerifyInput = z.infer<typeof loginVerifySchema>;
