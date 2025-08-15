import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  AuthContextType,
  LoginCredentials,
  SignupCredentials,
} from "@/types/user";
import { authApi, ApiError } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getCurrentUser();
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        businessType: userData.businessType,
        businessName: userData.businessName,
        address: userData.address,
        contactNo: userData.contactNo,
      });
    } catch (error) {
      console.error("❌ Failed to check auth status:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    credentials: LoginCredentials
  ): Promise<true | string> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      console.log("🧠 Login response.user:", response.user); // ✅ Add here
      localStorage.setItem("token", response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        businessType: response.user.businessType,
        businessName: response.user.businessName,
        address: response.user.address,
        contactNo: response.user.contactNo,
      });
      return true;
    } catch (error: any) {
      console.error("❌ Login error:", error);
      if (error instanceof ApiError && error.status === 503) {
        return "Database down. Please try again later.";
      }
      if (error instanceof ApiError) {
        return error.message;
      }
      return "Unexpected login error";
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    credentials: SignupCredentials
  ): Promise<true | string> => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        businessType: credentials.businessType,
        businessName: credentials.businessName,
        address: credentials.address,
        contactNo: credentials.contactNo,
      });

      localStorage.setItem("token", response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        businessType: response.user.businessType,
        businessName: response.user.businessName,
        address: response.user.address,
        contactNo: response.user.contactNo,
      });

      return true;
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      if (error instanceof ApiError && error.status === 503) {
        return "Database down. Please try again later.";
      }
      if (error instanceof ApiError) {
        return error.message;
      }
      return "Unexpected signup error";
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
