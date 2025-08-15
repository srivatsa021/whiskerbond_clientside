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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    businessType: z.enum(["vet", "trainer", "boarding", "walker", "ngo"] as const),
    businessName: z.string().min(2, "Business name is required"),
    address: z.string().min(10, "Enter a valid address"),
    contactNo: z
      .string()
      .min(10, "Contact number must be at least 10 digits")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [error, setError] = useState<string>("");
  const { signup, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const businessType = watch("businessType");

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setError("");

    const signupData = {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      businessType: data.businessType,
      businessName: data.businessName,
      address: data.address,
      contactNo: data.contactNo,
    };

    const result = await signup(signupData);

    if (typeof result === "string") {
      setError(result);
    } else if (!result) {
      setError("Account creation failed. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join our pet service platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter your full name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Create a password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm your password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select onValueChange={(value) => setValue("businessType", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vet">Veterinary Hospital</SelectItem>
                <SelectItem value="trainer">Pet Trainer</SelectItem>
                <SelectItem value="boarding">Pet Boarding</SelectItem>
                <SelectItem value="walker">Pet Walker</SelectItem>
                <SelectItem value="ngo">NGO/Shelter</SelectItem>
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-sm text-red-600">{errors.businessType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">
              {businessType === "ngo" ? "Organization Name" : "Business Name"}
            </Label>
            <Input
              id="businessName"
              placeholder="Enter your business/organization name"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-sm text-red-600">{errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter full address"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNo">Phone Number</Label>
            <Input
              id="contactNo"
              type="tel"
              placeholder="Enter contact number"
              {...register("contactNo")}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center">
          <Button variant="link" onClick={onSwitchToLogin} className="text-sm">
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
