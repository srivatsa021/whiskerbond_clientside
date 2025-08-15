import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Plus,
  Upload,
  AlertCircle,
  Camera,
  Heart,
  Pill,
  Settings,
  Bed,
  Users,
  Bell,
  DollarSign,
  CheckCircle,
  Video,
  Stethoscope,
  CreditCard,
  Phone,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Corrected import path for authApi
// Assuming api.ts is located at 'src/api.ts' and BoardingDashboard.tsx is at 'src/pages/dashboard/BoardingDashboard.tsx'
import { authApi } from "../../lib/api";

const BoardingDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [trainerName, setTrainerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Use authApi.getCurrentUser() to fetch profile data
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
  }, []); // Empty dependency array means this runs once on mount

  // Handler for saving personal profile information
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Use authApi.updateProfile() to send the update request
      // The authApi handles adding the token and setting Content-Type
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

  const [bookings] = useState([
    {
      id: 1,
      petName: "Fluffy",
      ownerName: "Jennifer Wilson",
      checkIn: "2024-01-15",
      checkOut: "2024-01-20",
      status: "current",
      roomType: "Deluxe Suite",
      specialNeeds: "Medication twice daily",
    },
    {
      id: 2,
      petName: "Oscar",
      ownerName: "David Kim",
      checkIn: "2024-01-18",
      checkOut: "2024-01-22",
      status: "upcoming",
      roomType: "Standard Room",
      specialNeeds: "None",
    },
    {
      id: 3,
      petName: "Milo",
      ownerName: "Rachel Green",
      checkIn: "2024-01-10",
      checkOut: "2024-01-14",
      status: "completed",
      roomType: "Premium Room",
      specialNeeds: "Special diet",
    },
  ]);

  // State for SOS form
  const [incidentType, setIncidentType] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");

  const handleSubmitEmergencyReport = () => {
    console.log("Emergency Report Submitted:", { incidentType, incidentDescription });
    // Add logic to submit the report, e.g., to an API
    alert("Emergency Report Submitted!");
    setIncidentType("");
    setIncidentDescription("");
  };

  // Removed all states and handlers related to "General Information"
  // as per your request to scratch that tab.

  return (
    <DashboardLayout title="Pet Boarding Dashboard">
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="sos">SOS</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <h2 className="text-2xl font-bold">Pet Boarding Schedule</h2>

          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {booking.petName} - {booking.roomType}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Owner: {booking.ownerName}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">
                            Check-in: {booking.checkIn}
                          </span>
                          <span className="text-sm text-gray-600">
                            Check-out: {booking.checkOut}
                          </span>
                        </div>
                        <p className="text-sm text-orange-600 mt-1">
                          Special needs: {booking.specialNeeds}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Appointment Details
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <p>
                              <span className="font-semibold">Pet:</span>{" "}
                              {booking.petName}
                            </p>
                            <p>
                              <span className="font-semibold">Owner:</span>{" "}
                              {booking.ownerName}
                            </p>
                            <p>
                              <span className="font-semibold">Check-in:</span>{" "}
                              {booking.checkIn}
                            </p>
                            <p>
                              <span className="font-semibold">Check-out:</span>{" "}
                              {booking.checkOut}
                            </p>
                            <p>
                              <span className="font-semibold">Room Type:</span>{" "}
                              {booking.roomType}
                            </p>
                            <p>
                              <span className="font-semibold">Status:</span>{" "}
                              {booking.status}
                            </p>
                            <p>
                              <span className="font-semibold">Special Needs:</span>{" "}
                              {booking.specialNeeds}
                            </p>
                          </div>
                          <div className="space-y-4 pt-4 border-t">
                            <Button variant="outline" className="w-full justify-start">
                              <Upload className="h-4 w-4 mr-2" /> Upload Prescription
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                              <FileText className="h-4 w-4 mr-2" /> View Medical History
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Finance Tab Content */}
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
                  <span>Total Revenue:</span>
                  <span className="font-semibold">₹85,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Outstanding Payments:</span>
                  <span className="font-semibold">₹12,500</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Payout:</span>
                  <span className="font-semibold">3 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Consultations Completed:</span>
                  <span className="font-semibold">42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Upcoming Billing:</span>
                  <span className="font-semibold">₹8,300 (Next Week)</span>
                </div>
              </div>
              <Button className="mt-4 w-full" variant="secondary">
                <CreditCard className="h-4 w-4 mr-2" /> Manage Payouts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOS Tab Content */}
        <TabsContent value="sos" className="space-y-6">
          <h2 className="text-2xl font-bold">SOS Emergency System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contacts Card */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" /> Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold mb-2">Quick Emergency Actions</h4>
                <div className="space-y-2">
                  <Button className="w-full justify-start bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="h-4 w-4 mr-2" /> Contact Pet Owner
                  </Button>
                  <Button className="w-full justify-start bg-red-500 hover:bg-red-600 text-white">
                    <Stethoscope className="h-4 w-4 mr-2" /> Call Veterinary
                    Emergency
                  </Button>
                </div>
                <h4 className="font-semibold mt-4 mb-2">
                  Emergency Protocols
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  <li>Immediately secure the pet's safety.</li>
                  <li>Contact the owner via app notification.</li>
                  <li>If medical emergency, call nearest vet clinic.</li>
                  <li>Document incident with photos if safe.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Emergency Report Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Emergency Report Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Use this form to report any emergency situations during
                  boarding or related to a pet.
                </p>
                <div>
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Input
                    id="incidentType"
                    placeholder="e.g., Pet injury, lost pet, etc."
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the emergency situation..."
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleSubmitEmergencyReport}
                >
                  Submit Emergency Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact Information Section */}
          <h3 className="text-xl font-bold mt-6">
            Emergency Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-semibold">24/7 Vet Emergency</p>
                <p className="text-lg font-bold text-blue-600">
                  (555) 123-PETS
                </p>
                <p className="text-sm text-gray-600">Emergency Animal Hospital</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-semibold">Facility Manager</p>
                <p className="text-lg font-bold text-blue-600">
                  (555) 456-MGMT
                </p>
                <p className="text-sm text-gray-600">24/7 On-call</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="font-semibold">Local Animal Control</p>
                <p className="text-lg font-bold text-blue-600">
                  (555) 789-CTRL
                </p>
                <p className="text-sm text-gray-600">Animal Control Services</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1">
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
                        <Label htmlFor="trainerName">Name</Label>
                        <Input
                          id="trainerName"
                          value={trainerName}
                          onChange={(e) => setTrainerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
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

            {/* Removed New General Information Tab Content */}
          </Tabs>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default BoardingDashboard;
