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
import { authApi, vetProfileApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const personalInfoSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
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

const VetSettings = () => {
  const { user, setUser } = useAuth();
  const [videoConsultEnabled, setVideoConsultEnabled] = useState(true);
  const [emergencyServicesEnabled, setEmergencyServicesEnabled] =
    useState(true);
  const [businessName, setBusinessName] = useState(user?.businessName || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      contactNo: user?.contactNo || "",
      address: user?.address || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        contactNo: user.contactNo || "",
        address: user.address,
      });
      setBusinessName(user.businessName);
    }
  }, [user, reset]);

  const onSavePersonalInfo = async (data: PersonalInfoFormData) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      toast({
        title: "Success",
        description: "Personal information updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update personal info:", error);
      toast({
        title: "Error",
        description: "Failed to update personal information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfileChanges = async () => {
    if (!user) return;

    try {
      const updatedData = { businessName };
      const updatedUser = await authApi.updateProfile(updatedData);

      setUser((prevUser) =>
        prevUser ? { ...prevUser, ...updatedUser } : null
      );

      toast({
        title: "Success",
        description: "Hospital profile updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update hospital profile:", error);
      toast({
        title: "Error",
        description: "Failed to update hospital profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyServicesToggle = async (enabled: boolean) => {
    setEmergencyServicesEnabled(enabled);
    try {
      await vetProfileApi.updateProfile({ emergency24Hrs: enabled });
      toast({
        title: "Success",
        description: "Emergency services status updated.",
      });
    } catch (error) {
      console.error("Failed to update emergency services status:", error);
      toast({
        title: "Error",
        description: "Failed to update emergency services status.",
        variant: "destructive",
      });
      // Revert the state if the API call fails
      setEmergencyServicesEnabled(!enabled);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Settings</h2>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger
            value="general"
            className="text-xs md:text-sm h-8 md:h-10"
          >
            General Settings
          </TabsTrigger>
          <TabsTrigger
            value="personal-info"
            className="text-xs md:text-sm h-8 md:h-10"
          >
            Personal Information
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="mt-4 md:mt-6 space-y-4 md:space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Video className="h-4 w-4 md:h-5 md:w-5" />
                Video Consultation Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex-1">
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
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Stethoscope className="h-4 w-4 md:h-5 md:w-5" />
                Service Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex-1">
                  <p className="font-medium text-sm md:text-base">
                    Enable Emergency Services
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Display availability for emergency services.
                  </p>
                </div>
                <Switch
                  checked={emergencyServicesEnabled}
                  onCheckedChange={handleEmergencyServicesToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Hospital Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hospitalName" className="text-sm md:text-base">
                  Hospital Name
                </Label>
                <Input
                  id="hospitalName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="license" className="text-sm md:text-base">
                  License Number
                </Label>
                <Input id="license" placeholder="Enter license number" />
              </div>
              <div>
                <Label
                  htmlFor="emergencyHours"
                  className="text-sm md:text-base"
                >
                  Emergency Hours
                </Label>
                <Textarea
                  id="emergencyHours"
                  placeholder="Describe emergency availability"
                  defaultValue="24/7 emergency services available"
                  className="min-h-[80px] md:min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleSaveProfileChanges}
                className="w-full md:w-auto"
              >
                Save Profile Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="personal-info"
          className="mt-4 md:mt-6 space-y-4 md:space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSavePersonalInfo)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base">
                    Your Name
                  </Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs md:text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hospitalEmail"
                    className="text-sm md:text-base"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="hospitalEmail"
                    type="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs md:text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hospitalContact"
                    className="text-sm md:text-base"
                  >
                    Contact Number
                  </Label>
                  <Input
                    id="hospitalContact"
                    type="tel"
                    {...register("contactNo")}
                  />
                  {errors.contactNo && (
                    <p className="text-xs md:text-sm text-red-600">
                      {errors.contactNo.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hospitalAddress"
                    className="text-sm md:text-base"
                  >
                    Hospital Address
                  </Label>
                  <Textarea
                    id="hospitalAddress"
                    {...register("address")}
                    className="min-h-[80px] md:min-h-[100px]"
                  />
                  {errors.address && (
                    <p className="text-xs md:text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Save Personal Info
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VetSettings;
