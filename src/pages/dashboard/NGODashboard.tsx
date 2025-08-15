import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  Plus,
  Upload,
  Users,
  DollarSign,
  Award,
  FileText,
  Settings,
  Bell,
  Key,
  Phone,
  AlertTriangle,
  ClipboardCheck,
  Info,
  CreditCard,
  Video,
  Stethoscope,
  User,
  Trash2,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, ngoPetsApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

interface PetProfile {
  _id: string;
  petName: string;
  species: string;
  breed?: string;
  age?: string;
  description?: string;
  status: "available" | "pending" | "adopted";
  medicalHistory?: { date: string; description: string }[];
  applications?: number;
}

const NGODashboard = () => {
  const { user, setUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [videoConsultEnabled, setVideoConsultEnabled] = useState(false);
  const [emergencyServicesEnabled, setEmergencyServicesEnabled] =
    useState(false);

  const [adoptablePets, setAdoptablePets] = useState<PetProfile[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [petFormData, setPetFormData] = useState({
    petName: "",
    species: "",
    breed: "",
    age: "",
    description: "",
  });

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "adopted":
        return <Badge className="bg-blue-100 text-blue-800">Adopted</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "planning":
        return (
          <Badge className="bg-purple-100 text-purple-800">Planning</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // --- Adoptable Pets Logic ---
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setIsLoadingPets(true);
    try {
      const pets = await ngoPetsApi.getPets();
      setAdoptablePets(pets);
    } catch (error) {
      console.error("Failed to fetch pets", error);
      toast({
        title: "Error",
        description: "Could not fetch pets.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPets(false);
    }
  };

  const resetPetForm = () => {
    setPetFormData({
      petName: "",
      species: "",
      breed: "",
      age: "",
      description: "",
    });
    setEditingPet(null);
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await ngoPetsApi.updatePet(editingPet._id, petFormData);
        toast({ title: "Success", description: "Pet profile updated." });
      } else {
        await ngoPetsApi.createPet(petFormData);
        toast({ title: "Success", description: "Pet profile created." });
      }
      setIsPetDialogOpen(false);
      resetPetForm();
      fetchPets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pet profile.",
        variant: "destructive",
      });
    }
  };

  const handleEditPet = (pet: PetProfile) => {
    setEditingPet(pet);
    setPetFormData({
      petName: pet.petName,
      species: pet.species,
      breed: pet.breed || "",
      age: pet.age || "",
      description: pet.description || "",
    });
    setIsPetDialogOpen(true);
  };

  const handleDeletePet = async (petId: string) => {
    try {
      await ngoPetsApi.deletePet(petId);
      toast({ title: "Success", description: "Pet profile deleted." });
      fetchPets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pet profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="NGO/Shelter Dashboard">
      <Tabs defaultValue="pets" className="space-y-5">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pets">Adoptable Pets</TabsTrigger>
          <TabsTrigger value="adoption">Adoption Workflow</TabsTrigger>
          <TabsTrigger value="finance">Finances</TabsTrigger>
          <TabsTrigger value="sos">SOS</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Adoptable Pet Profiles</h2>
            <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Pet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPet ? "Edit" : "Add New"} Pet Profile
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePetSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name</Label>
                    <Input
                      id="petName"
                      placeholder="Enter pet name"
                      value={petFormData.petName}
                      onChange={(e) =>
                        setPetFormData({
                          ...petFormData,
                          petName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="species">Species</Label>
                    <Select
                      value={petFormData.species}
                      onValueChange={(value) =>
                        setPetFormData({ ...petFormData, species: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      placeholder="Enter breed"
                      value={petFormData.breed}
                      onChange={(e) =>
                        setPetFormData({
                          ...petFormData,
                          breed: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      placeholder="e.g., 2 years"
                      value={petFormData.age}
                      onChange={(e) =>
                        setPetFormData({ ...petFormData, age: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the pet's personality and characteristics..."
                      value={petFormData.description}
                      onChange={(e) =>
                        setPetFormData({
                          ...petFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    {editingPet ? "Update" : "Add"} Pet Profile
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingPets ? (
              <p>Loading pets...</p>
            ) : (
              adoptablePets.map((pet) => (
                <Card key={pet._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <CardTitle className="text-lg">{pet.petName}</CardTitle>
                      </div>
                      {getStatusBadge(pet.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Species:</span>{" "}
                        {pet.species}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Breed:</span> {pet.breed}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Age:</span> {pet.age}
                      </p>
                      <p className="text-sm text-gray-600">{pet.description}</p>
                      {pet.applications && pet.applications > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          View Applications ({pet.applications})
                        </Button>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPet(pet)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the profile for{" "}
                                {pet.petName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePet(pet._id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="adoption" className="space-y-6">
          <h2 className="text-2xl font-bold">Adoption Workflow Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Adoption Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Application for Shadow</h4>
                        <p className="text-sm text-gray-600">
                          Applicant: Jennifer Smith
                        </p>
                        <p className="text-sm text-gray-600">
                          Application Date: 2024-01-15
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Under Review
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm">Review Application</Button>
                      <Button size="sm" variant="outline">
                        Schedule Meet & Greet
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">
                          Application for Whiskers
                        </h4>
                        <p className="text-sm text-gray-600">
                          Applicant: Mark Johnson
                        </p>
                        <p className="text-sm text-gray-600">
                          Application Date: 2024-01-12
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Approved
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm">Schedule Pickup</Button>
                      <Button size="sm" variant="outline">
                        Prepare Paperwork
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adoption Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Monthly Adoption Goal
                      </span>
                      <span className="text-sm text-gray-600">8/12</span>
                    </div>
                    <Progress value={67} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">23</p>
                      <p className="text-sm text-blue-800">Total Adoptions</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">15</p>
                      <p className="text-sm text-green-800">Available Pets</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Adoption Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Contact Approved Families
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <h2 className="text-2xl font-bold">Finance Overview</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="monthFilter">View by Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
                  </SelectContent>
                </Select>
              </div>

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

        <TabsContent value="sos" className="space-y-6">
          <h2 className="text-2xl font-bold">SOS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Quick Emergency Actions
                  </h3>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="h-4 w-4 mr-2" /> Contact Pet Owner
                  </Button>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="h-4 w-4 mr-2" /> Call Veterinary Emergency
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Emergency Report Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Use this form to report any emergency situations during a walk
                  or related to a pet.
                </p>

                <div className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Input
                      id="incidentType"
                      placeholder="e.g., Pet injury, lost pet, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyDescription">Description</Label>
                    <Textarea
                      id="emergencyDescription"
                      placeholder="Describe the emergency situation..."
                    />
                  </div>
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                    Submit Emergency Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Settings</h2>

          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal-info">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="general">General Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="personal-info" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onSavePersonalInfo)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ngoName">NGO Name</Label>
                      <Input id="ngoName" {...register("businessName")} />
                      {errors.businessName && (
                        <p className="text-sm text-red-600">
                          {errors.businessName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospitalEmail">Email Address</Label>
                      <Input
                        id="hospitalEmail"
                        type="email"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospitalContact">Contact Number</Label>
                      <Input
                        id="hospitalContact"
                        type="tel"
                        {...register("contactNo")}
                      />
                      {errors.contactNo && (
                        <p className="text-sm text-red-600">
                          {errors.contactNo.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospitalAddress"> Address</Label>
                      <Textarea id="hospitalAddress" {...register("address")} />
                      {errors.address && (
                        <p className="text-sm text-red-600">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit">Save Personal Info</Button>
                  </CardContent>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Consultation Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Video Consultations</p>
                      <p className="text-sm text-gray-600">
                        Allow patients to book video consultation appointments
                      </p>
                    </div>
                    <Switch
                      checked={videoConsultEnabled}
                      onCheckedChange={setVideoConsultEnabled}
                    />
                  </div>
                  {videoConsultEnabled && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Video consultations are enabled. Patients can now book
                        virtual appointments through your profile.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Service Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Emergency Services</p>
                      <p className="text-sm text-gray-600">
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
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};
export default NGODashboard;
