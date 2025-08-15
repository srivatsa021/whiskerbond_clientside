import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {isSignup ? (
          <SignupForm onSwitchToLogin={() => setIsSignup(false)} />
        ) : (
          <LoginForm onSwitchToSignup={() => setIsSignup(true)} />
        )}
      </div>
    </div>
  );
};

export default Login;
