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
import PhotoManager from "@/components/profile/PhotoManager";


const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    businessType: z.enum([
      "vet",
      "trainer",
      "boarding",
      "walker",
      "ngo",
    ] as const),
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
  const [images, setImages] = useState<string[]>([]);

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
      images: images.slice(0, 10),
    };

    const result = await signup(signupData);

    if (typeof result === "string") {
      setError(result);
    } else if (!result) {
      setError("Account creation failed. Please try again.");
    }
  };

  return (
    <Card className="w-full mx-auto shadow-lg">
      <CardHeader className="space-y-2 md:space-y-3 px-4 md:px-8 pt-6 md:pt-6 pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl lg:text-3xl text-center font-bold">
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-sm md:text-base text-gray-600">
          Join our pet service platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 px-4 md:px-8 pb-6 md:pb-8">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="space-y-4 md:space-y-5"
        >
          {/* Name and Email in grid for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm md:text-base font-medium"
              >
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...register("name")}
                className="text-sm md:text-base h-10 md:h-11"
              />
              {errors.name && (
                <p className="text-xs md:text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm md:text-base font-medium"
              >
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm md:text-base font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register("password")}
                className="text-sm md:text-base h-10 md:h-11"
              />
              {errors.password && (
                <p className="text-xs md:text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm md:text-base font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className="text-sm md:text-base h-10 md:h-11"
              />
              {errors.confirmPassword && (
                <p className="text-xs md:text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Business Type and Name in grid for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="businessType"
                className="text-sm md:text-base font-medium"
              >
                Business Type
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("businessType", value as any)
                }
              >
                <SelectTrigger className="text-sm md:text-base h-10 md:h-11">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vet" className="text-sm md:text-base">
                    Veterinary Hospital
                  </SelectItem>
                  <SelectItem value="trainer" className="text-sm md:text-base">
                    Pet Trainer
                  </SelectItem>
                  <SelectItem value="boarding" className="text-sm md:text-base">
                    Pet Boarding
                  </SelectItem>
                  <SelectItem value="walker" className="text-sm md:text-base">
                    Pet Walker
                  </SelectItem>
                  <SelectItem value="ngo" className="text-sm md:text-base">
                    NGO/Shelter
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-xs md:text-sm text-red-600">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="businessName"
                className="text-sm md:text-base font-medium"
              >
                {businessType === "ngo" ? "Organization Name" : "Business Name"}
              </Label>
              <Input
                id="businessName"
                placeholder="Enter business name"
                {...register("businessName")}
                className="text-sm md:text-base h-10 md:h-11"
              />
              {errors.businessName && (
                <p className="text-xs md:text-sm text-red-600">
                  {errors.businessName.message}
                </p>
              )}
            </div>
          </div>

          {/* Address and Phone in grid for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm md:text-base font-medium"
              >
                Address
              </Label>
              <Textarea
                id="address"
                placeholder="Enter full address"
                {...register("address")}
                className="text-sm md:text-base min-h-[80px] md:min-h-[80px] resize-none"
              />
              {errors.address && (
                <p className="text-xs md:text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="contactNo"
                className="text-sm md:text-base font-medium"
              >
                Phone Number
              </Label>
              <Input
                id="contactNo"
                type="tel"
                placeholder="Enter contact number"
                {...register("contactNo")}
                className="text-sm md:text-base h-10 md:h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm md:text-base font-medium">Photos (up to 10)</Label>
            <PhotoManager value={images} onChange={setImages} />
          </div>

          {error && (
            <Alert variant="destructive" className="text-xs md:text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={() => handleSubmit(onSubmit)()}
            className="w-full h-10 md:h-11 text-sm md:text-base font-medium mt-4 md:mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center pt-3 md:pt-4">
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="text-xs md:text-sm p-0 h-auto font-normal"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
