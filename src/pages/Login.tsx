import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-3 left-3 md:top-4 md:left-4 lg:top-6 lg:left-6 flex items-center gap-2 text-gray-600 hover:text-red-600 transition-all duration-200 ease-in-out transform hover:scale-105 text-xs md:text-sm z-10"
      >
        <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
        <span>Back</span>
      </Button>

      <div
        className={`w-full ${isSignup ? "max-w-md md:max-w-2xl" : "max-w-sm md:max-w-md"} ${isSignup ? "mt-8 md:mt-0" : ""}`}
      >
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
