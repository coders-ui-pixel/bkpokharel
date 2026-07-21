import { useMutation } from "@tanstack/react-query";
import * as twoFactorApi from "./api";

export function useBeginTwoFactorSetup() {
  return useMutation({ mutationFn: twoFactorApi.beginTwoFactorSetup });
}

export function useConfirmTwoFactorSetup() {
  return useMutation({ mutationFn: (token: string) => twoFactorApi.confirmTwoFactorSetup(token) });
}

export function useDisableTwoFactor() {
  return useMutation({ mutationFn: (token: string) => twoFactorApi.disableTwoFactor(token) });
}
