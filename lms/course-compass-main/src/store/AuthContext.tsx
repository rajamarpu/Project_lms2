import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/api/auth.api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  avatar?: string;
  hoursLearned?: number;
  certificates?: number;
  streak?: number;
}
  
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: "user" | "instructor") => Promise<{ pending?: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Try to read the cached user from localStorage. */
function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem("lms_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readCachedUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem("lms_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("lms_token");
      if (!savedToken) {
        // No token at all – make sure state is clean
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await authApi.getMe();
        // Token is valid – update user with fresh server data
        const freshUser = res.data.data as User;
        setUser(freshUser);
        setToken(savedToken);
        localStorage.setItem("lms_user", JSON.stringify(freshUser));
      } catch (err: unknown) {
        const isNetworkError =
          !err || (typeof err === "object" && !(err as { response?: unknown }).response);

        if (isNetworkError) {
          // Server is temporarily unreachable – keep the cached user and
          // token so the app stays usable.  The next action will retry.
          setIsLoading(false);
          return;
        }

        // Auth failure (401 after failed refresh, etc.) – clear session
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("lms_token", newToken);
    localStorage.setItem("lms_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name: string, email: string, password: string, role: "user" | "instructor" = "user") => {
    const res = await authApi.register({ name, email, password, role });
    
    // If user is pending approval, don't store a token — just return pending info
    if (res.data.pending) {
      return { pending: true, message: res.data.message };
    }

    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("lms_token", newToken);
    localStorage.setItem("lms_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return {};
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("lms_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
