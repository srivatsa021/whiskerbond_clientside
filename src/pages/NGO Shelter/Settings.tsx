import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Stethoscope, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const personalInfoSchema = z.object({
  businessName: z
    .string()
    .min(3, { message: "NGO name must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  contactNo: z
    .string()
    .min(10, { message: "Contact number must be at least 10 digits." })
    .max(15, { message: "Contact number cannot exceed 15 digits." }),
  address: z
    .string()
    .min(10, { message: "Address must be at least 10 characters." }),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

const Settings = () => {
  const { user, setUser } = useAuth();
  const [videoConsultEnabled, setVideoConsultEnabled] = useState(false);
  const [emergencyServicesEnabled, setEmergencyServicesEnabled] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      businessName: user?.businessName || "",
      email: user?.email || "",
      contactNo: user?.contactNo || "",
      address: user?.address || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        businessName: user.businessName,
        email: user.email,
        contactNo: user.contactNo || "",
        address: user.address,
      });
    }
  }, [user, reset]);

  const onSavePersonalInfo = async (data: PersonalInfoFormData) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.updateProfile({
        name: user.name, // Keep the original name
        ...data,
      });
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      toast({ title: "Success", description: "Personal info saved!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save personal info.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-lg md:text-2xl font-bold">Settings</h2>

      <Tabs defaultValue="personal-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger
            value="personal-info"
            className="text-xs md:text-sm py-2"
          >
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="general" className="text-xs md:text-sm py-2">
            General Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSavePersonalInfo)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ngoName" className="text-sm">
                      NGO Name
                    </Label>
                    <Input id="ngoName" {...register("businessName")} />
                    {errors.businessName && (
                      <p className="text-xs text-red-600">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalEmail" className="text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="hospitalEmail"
                      type="email"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hospitalContact" className="text-sm">
                      Contact Number
                    </Label>
                    <Input
                      id="hospitalContact"
                      type="tel"
                      {...register("contactNo")}
                    />
                    {errors.contactNo && (
                      <p className="text-xs text-red-600">
                        {errors.contactNo.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospitalAddress" className="text-sm">
                      Address
                    </Label>
                    <Textarea
                      id="hospitalAddress"
                      {...register("address")}
                      rows={3}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-600">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full md:w-auto" size="sm">
                  Save Personal Info
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-4 md:mt-6">
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="h-4 w-4 md:h-5 md:w-5" />
                  Video Consultation Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm md:text-base">
                      Enable Video Consultations
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Allow patients to book video consultation appointments
                    </p>
                  </div>
                  <Switch
                    checked={videoConsultEnabled}
                    onCheckedChange={setVideoConsultEnabled}
                  />
                </div>
                {videoConsultEnabled && (
                  <div className="mt-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs md:text-sm text-blue-800">
                      Video consultations are enabled. Patients can now book
                      virtual appointments through your profile.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-4 w-4 md:h-5 md:w-5" />
                  Service Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm md:text-base">
                      Enable Emergency Services
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Display availability for emergency services.
                    </p>
                  </div>
                  <Switch
                    checked={emergencyServicesEnabled}
                    onCheckedChange={setEmergencyServicesEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
