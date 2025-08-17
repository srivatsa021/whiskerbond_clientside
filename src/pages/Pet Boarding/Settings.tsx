import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi } from "@/lib/api";

const Settings = () => {
  const [trainerName, setTrainerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await authApi.getCurrentUser();
        setTrainerName(data.name || "");
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
      const response = await authApi.updateProfile({
        name: trainerName,
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
      <h2 className="text-lg md:text-2xl font-bold">Settings</h2>

      <Tabs defaultValue="personal" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-1 h-auto p-1">
          <TabsTrigger value="personal" className="text-xs md:text-sm py-2">
            Personal Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingProfile ? (
                <div className="text-center py-4">
                  <p className="text-sm md:text-base">Loading profile...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trainerName" className="text-sm">
                        Name
                      </Label>
                      <Input
                        id="trainerName"
                        value={trainerName}
                        onChange={(e) => setTrainerName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="w-full md:w-auto"
                    size="sm"
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
