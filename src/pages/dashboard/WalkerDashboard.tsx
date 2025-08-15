import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Plus,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Route,
  Settings,
  Bell,
  User,
  Smartphone,
  DollarSign,
  Stethoscope,
  Video,
  CreditCard,
  AlertTriangle,
  ClipboardCheck,
  Phone,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Import the authApi from your api.ts file
// Corrected import path based on your precise file structure:
// C:\Users\riyas\Desktop\WhiskerBond\whiskerBond_businessSide_v7\src\pages\dashboard\BoardingDashBoard.tsx
// C:\Users\riyas\Desktop\WhiskerBond\whiskerBond_businessSide_v7\src\lib\api.ts
import { authApi } from "../../lib/api";

const WalkerDashboard = () => {
  const [walkSchedule, setWalkSchedule] = useState([
    {
      id: 1,
      petName: "Max",
      ownerName: "John Smith",
      date: "2024-07-20", // Added date for consistency with BoardingDashboard
      time: "08:00 AM",
      duration: "30 min",
      status: "upcoming",
      location: "Central Park Area",
      notes: "Max is energetic in the mornings. Likes to chase squirrels.",
      type: "Checkup",
    },
    {
      id: 2,
      petName: "Luna",
      ownerName: "Sarah Johnson",
      date: "2024-07-19",
      time: "10:30 AM",
      duration: "45 min",
      status: "in-progress",
      location: "Riverside Walk",
      notes: "Luna is calm, loves sniffing.",
      type: "Walk",
    },
    {
      id: 3,
      petName: "Bella",
      ownerName: "Emma Davis",
      date: "2024-07-20",
      time: "04:30 PM",
      duration: "30 min",
      status: "upcoming",
      location: "Oak Street Neighborhood",
      notes: "Bella is sweet. Avoid crowded areas.",
      type: "Walk",
    },
  ]);

  const [selectedWalk, setSelectedWalk] = useState(null);
  const [dialogNotes, setDialogNotes] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
        // Use authApi.getCurrentUser() to fetch profile data for the logged-in user
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
  }, []); // Empty dependency array means this runs once on mount

  // Handler for saving personal profile information
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Use authApi.updateProfile() to send the update request
      // The authApi handles adding the authentication token and setting Content-Type
      const response = await authApi.updateProfile({
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

  const handleOpenWalkDetails = (walk: any) => { // Added type 'any' for 'walk'
    setSelectedWalk(walk);
    setDialogNotes(walk.notes);
  };

  const handleSaveWalkDetails = () => {
    if (selectedWalk) {
      setWalkSchedule((prevSchedule) =>
        prevSchedule.map((walk) =>
          walk.id === (selectedWalk as any).id ? { ...walk, notes: dialogNotes } : walk // Cast to any
        )
      );
      setSelectedWalk(null);
    }
  };

  // State and handler for General Information are REMOVED as per previous discussion
  // const [walkerServiceArea, setWalkerServiceArea] = useState("Pune, Maharashtra");
  // const [walkerAvailability, setWalkerAvailability] = useState("Monday - Friday, 8 AM - 6 PM");
  // const [emergencyContactWalker, setEmergencyContactWalker] = useState("Sarah Connor (Manager) - (555) 111-2222");

  // const handleSaveGeneralInfo = () => {
  //   console.log("General Information Saved:", {
  //     walkerServiceArea,
  //     walkerAvailability,
  //     emergencyContactWalker,
  //   });
  //   alert("General Information Saved!");
  // };

  // SOS form states and handler (reused from BoardingDashboard)
  const [incidentType, setIncidentType] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");

  const handleSubmitEmergencyReport = () => {
    console.log("Emergency Report Submitted:", { incidentType, incidentDescription });
    alert("Emergency Report Submitted!");
    setIncidentType("");
    setIncidentDescription("");
  };

  return (
    <DashboardLayout title="Pet Walker Dashboard">
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="sos">SOS</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Tasks Tab Content */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Today's Walking Schedule</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Walk
            </Button>
          </div>

          <div className="grid gap-4">
            {walkSchedule.map((walk) => (
              <Card key={walk.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Route className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {walk.petName} - {walk.duration} Walk
                        </h3>
                        <p className="text-sm text-gray-600">
                          Owner: {walk.ownerName}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {walk.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {walk.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">

                      <Dialog
                        onOpenChange={(isOpen) => !isOpen && setSelectedWalk(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenWalkDetails(walk)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        {selectedWalk && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Appointment Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              <p>
                                <span className="font-semibold">Pet:</span>{" "}
                                {selectedWalk.petName}
                              </p>
                              <p>
                                <span className="font-semibold">Owner:</span>{" "}
                                {selectedWalk.ownerName}
                              </p>
                              <p>
                                <span className="font-semibold">Time:</span>{" "}
                                {selectedWalk.time}
                              </p>
                              <p>
                                <span className="font-semibold">Type:</span>{" "}
                                {selectedWalk.type}
                              </p>
                              <p>
                                <span className="font-semibold">Status:</span>{" "}
                                {selectedWalk.status === "upcoming" ? "confirmed" : selectedWalk.status}
                              </p>
                            </div>
                            <div className="space-y-4 pt-4 border-t">
                              <Button variant="outline" className="w-full justify-start">
                                <Upload className="h-4 w-4 mr-2" /> Upload Prescription
                              </Button>
                              <Button variant="outline" className="w-full justify-start">
                                <Video className="h-4 w-4 mr-2" /> View Medical History
                              </Button>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Finance Tab Content (Reused from BoardingDashboard for consistency) */}
        <TabsContent value="finances" className="space-y-6">
          <h2 className="text-2xl font-bold">Finance Overview</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monthly Filter */}
              <div>
                <Label htmlFor="monthFilter">View by Month</Label>
                <Select
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-01">January 2025</SelectItem>
                    <SelectItem value="2025-02">February 2025</SelectItem>
                    <SelectItem value="2025-03">March 2025</SelectItem>
                    <SelectItem value="2025-04">April 2025</SelectItem>
                    <SelectItem value="2025-05">May 2025</SelectItem>
                    <SelectItem value="2025-06">June 2025</SelectItem>
                    <SelectItem value="2025-07">July 2025</SelectItem>
                    {/* Add more months as needed */}
                  </SelectContent>
                </Select>
              </div>

              {/* Date-wise Filter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full">Apply Filters</Button>

              {/* Financial data */}
              <div className="space-y-2 pt-4 border-t mt-4">
                <div className="flex items-center justify-between">
                  <span>Total Earnings:</span>
                  <span className="font-semibold">₹65,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Payments:</span>
                  <span className="font-semibold">₹8,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Payout:</span>
                  <span className="font-semibold">2 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Walks Completed:</span>
                  <span className="font-semibold">68</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Upcoming Payout:</span>
                  <span className="font-semibold">₹5,000 (Next Friday)</span>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="secondary">
                <CreditCard className="h-4 w-4 mr-2" /> Manage Payouts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOS System Tab Content */}
        <TabsContent value="sos" className="space-y-6">
          <h2 className="text-2xl font-bold">SOS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contacts Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Quick Emergency Actions</h3>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="h-4 w-4 mr-2" /> Contact Pet Owner
                  </Button>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    <Stethoscope className="h-4 w-4 mr-2" /> Call Veterinary Emergency
                  </Button>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Emergency Protocols</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    <li>Immediately secure the pet's safety.</li>
                    <li>Contact the owner via app notification.</li>
                    <li>If medical emergency, call nearest vet clinic.</li>
                    <li>Document incident with photos if safe.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Report Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Emergency Report Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Use this form to report any emergency situations during a walk or related to a pet.</p>

                <div className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Input
                      id="incidentType"
                      placeholder="e.g., Pet injury, lost pet, etc."
                      value={incidentType} // Connect to state
                      onChange={(e) => setIncidentType(e.target.value)} // Connect to state
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyDescription">Description</Label>
                    <Textarea
                      id="emergencyDescription"
                      placeholder="Describe the emergency situation..."
                      value={incidentDescription} // Connect to state
                      onChange={(e) => setIncidentDescription(e.target.value)} // Connect to state
                    />
                  </div>
                  <Button
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleSubmitEmergencyReport} // Connect to handler
                  >
                    Submit Emergency Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg text-center">
                  <p className="font-semibold">24/7 Vet Emergency</p>
                  <p className="text-lg text-red-600 font-bold">(555) 123-PETS</p>
                  <p className="text-sm text-gray-600">Emergency Animal Hospital</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="font-semibold">Walker Coordinator</p>
                  <p className="text-lg text-red-600 font-bold">(555) 456-WALK</p>
                  <p className="text-sm text-gray-600">24/7 Support Line</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="font-semibold">Local Animal Control</p>
                  <p className="text-lg text-red-600 font-bold">(555) 789-CTRL</p>
                  <p className="text-sm text-gray-600">Lost Pet Recovery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Settings Tab Content */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Settings</h2>

          {/* Nested Tabs for Settings */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1"> {/* Changed to 1 column */}
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              {/* Removed General Info TabTrigger */}
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingProfile ? (
                    <p>Loading profile...</p>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="walkerName">Name</Label>
                        <Input
                          id="walkerName"
                          value={walkerName} // Connected to state
                          onChange={(e) => setWalkerName(e.target.value)} // Connected to handler
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email} // Connected to state
                          onChange={(e) => setEmail(e.target.value)} // Connected to handler
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber} // Connected to state
                          onChange={(e) => setPhoneNumber(e.target.value)} // Connected to handler
                        />
                      </div>
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? "Saving..." : "Save Personal Info"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Removed New General Information Tab Content for Walker */}
          </Tabs>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default WalkerDashboard;
