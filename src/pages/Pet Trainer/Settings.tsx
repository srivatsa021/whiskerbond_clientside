import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Clock, FileText, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
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

const Settings = () => {
  const { user, setUser } = useAuth();

  // General Settings State
  const [videoConsultEnabled, setVideoConsultEnabled] = useState(false);
  const [emergencyServicesEnabled, setEmergencyServicesEnabled] =
    useState(false);
  const [businessHours, setBusinessHours] = useState("Mon-Fri, 9 AM - 5 PM");
  const [serviceAreas, setServiceAreas] = useState("Pune, Mumbai");
  const [cancellationPolicy, setCancellationPolicy] = useState(
    "Cancellations must be made 24 hours in advance for a full refund."
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

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
    }
  }, [user, reset]);

  const onSavePersonalInfo = async (data: PersonalInfoFormData) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.updateProfile({
        ...data,
        businessName: user.businessName, // Keep the existing business name
      });
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      toast({
        title: "Success",
        description: "Personal info saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save personal info.",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = () => {
    console.log("General Settings Saved:", {
      videoConsultEnabled,
      emergencyServicesEnabled,
      businessHours,
      serviceAreas,
      cancellationPolicy,
      emailNotifications,
      smsNotifications,
    });
    toast({
      title: "Success",
      description: "General settings saved successfully!",
    });
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
          <TabsTrigger
            value="general-settings"
            className="text-xs md:text-sm py-2"
          >
            General Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal-info" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSavePersonalInfo)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainerName" className="text-sm">
                      Trainer Name
                    </Label>
                    <Input id="trainerName" {...register("name")} />
                    {errors.name && (
                      <p className="text-xs text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
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
                    <Label htmlFor="address" className="text-sm">
                      Address
                    </Label>
                    <Textarea id="address" {...register("address")} rows={3} />
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

        <TabsContent value="general-settings" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                General Service & Business Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 border-b pb-4">
                <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Video className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                  Service Options
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <Label
                      htmlFor="video-consult"
                      className="flex flex-col space-y-1"
                    >
                      <span className="text-sm font-medium">
                        Enable Video Consultations
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Allow clients to book online video sessions.
                      </span>
                    </Label>
                    <Switch
                      id="video-consult"
                      checked={videoConsultEnabled}
                      onCheckedChange={setVideoConsultEnabled}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <Label
                      htmlFor="emergency-services"
                      className="flex flex-col space-y-1"
                    >
                      <span className="text-sm font-medium">
                        Enable Emergency Services
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Offer on-demand emergency assistance to clients.
                      </span>
                    </Label>
                    <Switch
                      id="emergency-services"
                      checked={emergencyServicesEnabled}
                      onCheckedChange={setEmergencyServicesEnabled}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-b pb-4">
                <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                  Business Availability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessHours" className="text-sm">
                      Business Hours
                    </Label>
                    <Input
                      id="businessHours"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      placeholder="e.g., Mon-Fri, 9 AM - 5 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceAreas" className="text-sm">
                      Service Areas
                    </Label>
                    <Input
                      id="serviceAreas"
                      value={serviceAreas}
                      onChange={(e) => setServiceAreas(e.target.value)}
                      placeholder="e.g., Pune, Mumbai, Nagpur"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-b pb-4">
                <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  Policies
                </h3>
                <div>
                  <Label htmlFor="cancellationPolicy" className="text-sm">
                    Cancellation Policy
                  </Label>
                  <Textarea
                    id="cancellationPolicy"
                    value={cancellationPolicy}
                    onChange={(e) => setCancellationPolicy(e.target.value)}
                    placeholder="Detail your cancellation policy here..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <Label
                      htmlFor="email-notifications"
                      className="flex flex-col space-y-1"
                    >
                      <span className="text-sm font-medium">
                        Email Notifications
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Receive alerts via email for new bookings,
                        cancellations, etc.
                      </span>
                    </Label>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <Label
                      htmlFor="sms-notifications"
                      className="flex flex-col space-y-1"
                    >
                      <span className="text-sm font-medium">
                        SMS Notifications
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Receive critical alerts via SMS (e.g., emergencies).
                      </span>
                    </Label>
                    <Switch
                      id="sms-notifications"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleSaveChanges} size="sm">
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
