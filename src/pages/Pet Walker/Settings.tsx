import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi } from "../../lib/api";

const Settings = () => {
  // States for Personal Information
  const [walkerName, setWalkerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch walker's personal profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await authApi.getCurrentUser();
        setWalkerName(data.name || "");
        setEmail(data.email || "");
        setPhoneNumber(data.contactNo || "");
      } catch (error) {
        console.error("Error fetching user profile:", error);
        alert("Failed to load profile. Please try again.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handler for saving personal profile information
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await authApi.updateProfile({
        name: walkerName,
        email: email,
        contactNo: phoneNumber,
      });

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${error.message || "Unknown error"}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Settings</h2>

      {/* Settings Tabs */}
      <Tabs defaultValue="personal" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="personal" className="text-sm md:text-base">
            Personal Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm md:text-base text-gray-600">
                    Loading profile...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="walkerName"
                      className="text-sm md:text-base"
                    >
                      Name
                    </Label>
                    <Input
                      id="walkerName"
                      value={walkerName}
                      onChange={(e) => setWalkerName(e.target.value)}
                      className="text-sm md:text-base"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm md:text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm md:text-base"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm md:text-base"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="text-sm md:text-base"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="w-full md:w-auto text-sm md:text-base"
                  >
                    {isSavingProfile ? "Saving..." : "Save Personal Info"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
