import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  refreshSessionRequest,
  verifyTwoFactorLoginRequest,
} from "../features/auth/api";
import type { LoginResult } from "../features/auth/api";
import type { LoginInput, RegisterInput, User } from "../features/auth/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<LoginResult>;
  verifyTwoFactorLogin: (pendingToken: string, code: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshSessionRequest()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const result = await loginRequest(input);
    if (!result.requiresTwoFactor) {
      setUser(result.user);
    }
    return result;
  }, []);

  const verifyTwoFactorLogin = useCallback(async (pendingToken: string, code: string) => {
    const loggedInUser = await verifyTwoFactorLoginRequest(pendingToken, code);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const newUser = await registerRequest(input);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, verifyTwoFactorLogin, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
