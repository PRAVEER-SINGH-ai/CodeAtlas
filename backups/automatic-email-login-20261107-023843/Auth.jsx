import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";

import api, {
  setAccessToken,
  clearAccessToken,
  getApiError
} from "../lib/api";

const AuthContext = createContext(null);
const SESSION_KEY = "codeatlas_dev_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);

      if (saved) {
        const session = JSON.parse(saved);

        if (session.demoMode && session.user) {
          setDemoMode(true);
          setUser(session.user);
        } else if (session.accessToken && session.user) {
          setAccessToken(session.accessToken);
          setUser(session.user);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }

    setLoading(false);
  }, []);

  const saveSession = useCallback((data) => {
    if (!data?.accessToken || !data?.user) {
      throw new Error("The server returned an incomplete login response.");
    }

    setAccessToken(data.accessToken);
    setUser(data.user);
    setDemoMode(false);

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        accessToken: data.accessToken,
        user: data.user,
        demoMode: false
      })
    );
  }, []);

  const startDemo = useCallback(() => {
    clearAccessToken();

    const demoUser = {
      _id: "codeatlas-demo-user",
      name: "Demo Developer",
      username: "demo_developer",
      email: "demo@codeatlas.local"
    };

    setUser(demoUser);
    setDemoMode(true);

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: demoUser,
        demoMode: true
      })
    );
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      return {
        success: true,
        requiresEmailVerification:
          Boolean(response.data.requiresEmailVerification),
        email: formData.email,
        message: response.data.message
      };
    } catch (error) {
      return { success: false, message: getApiError(error) };
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return { success: false, message: getApiError(error) };
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);

    try {
      const response = await api.post("/auth/login", credentials);
      saveSession(response.data);

      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        message: getApiError(error),
        requiresEmailVerification:
          Boolean(error.response?.data?.requiresEmailVerification)
      };
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local logout must still work if the server is unavailable.
    }

    clearAccessToken();
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setDemoMode(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoMode,
        isAuthenticated: Boolean(user),
        register,
        resendVerification,
        login,
        logout,
        startDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
