import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types/user";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [error, setError] = useState<string>("");
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setError("");
    const result = await login(data);
    if (typeof result === "string") {
      setError(result); // this is our "Database down" message
    } else if (!result) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Card className="w-full mx-auto shadow-lg">
      <CardHeader className="space-y-2 px-4 md:px-6 pt-4 md:pt-6 pb-2 md:pb-4">
        <CardTitle className="text-lg md:text-xl lg:text-2xl text-center font-bold">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-xs md:text-sm lg:text-base text-gray-600">
          Sign in to your pet service account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6 pb-4 md:pb-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 md:space-y-4"
        >
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="email" className="text-sm md:text-base font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="text-sm md:text-base h-10 md:h-11"
            />
            {errors.email && (
              <p className="text-xs md:text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1 md:space-y-2">
            <Label
              htmlFor="password"
              className="text-sm md:text-base font-medium"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              className="text-sm md:text-base h-10 md:h-11"
            />
            {errors.password && (
              <p className="text-xs md:text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="text-xs md:text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-10 md:h-11 text-sm md:text-base font-medium mt-4 md:mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center pt-2 md:pt-4">
          <Button
            variant="link"
            onClick={onSwitchToSignup}
            className="text-xs md:text-sm p-0 h-auto font-normal"
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
