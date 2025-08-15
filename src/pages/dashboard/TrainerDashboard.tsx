import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  BookOpen,
  Video,
  Plus,
  Clock,
  Upload,
  DollarSign,
  Award,
  Settings,
  AlertCircle,
  CheckCircle,
  FileText,
  CreditCard,
  Stethoscope,
  Phone,
  Mail,
  MessageSquare,
  Bell,
  Trash2,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAuth } from "@/contexts/AuthContext";
import { authApi, trainerPlansApi } from "@/lib/api";
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
interface TrainingPlan {
  _id: string;
  serviceName: string;
  description?: string;
  price: number;
  duration?: string;
}

const TrainerDashboard = () => {
  const { user, setUser } = useAuth();

  const [sessions] = useState([
    {
      id: 1,
      petName: "Buddy",
      ownerName: "Alice Cooper",
      time: "10:00 AM",
      type: "Basic Obedience",
      status: "upcoming",
      notes: [
        "2025-07-05: Practiced sit and stay commands",
        "2025-07-07: Improved leash walking",
      ],
    },
    {
      id: 2,
      petName: "Bella",
      ownerName: "Robert Lee",
      time: "02:00 PM",
      type: "Agility Training",
      status: "upcoming",
      notes: [
        "2025-07-01: Introduced tunnel run",
        "2025-07-03: Practiced jump obstacles",
      ],
    },
    {
      id: 3,
      petName: "Charlie",
      ownerName: "Emma Davis",
      time: "04:30 PM",
      type: "Behavioral Issues",
      status: "completed",
      notes: [
        "2025-06-20: Addressed barking issues",
        "2025-06-22: Focus training in public spaces",
      ],
    },
  ]);

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    description: "",
    price: 0,
    duration: "",
  });

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // State for SOS form
  const [incidentType, setIncidentType] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");

  const handleSubmitEmergencyReport = () => {
    console.log("Emergency Report Submitted:", {
      incidentType,
      incidentDescription,
    });
    alert("Emergency Report Submitted!");
    setIncidentType("");
    setIncidentDescription("");
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
    alert("General Settings Saved Successfully!");
  };

  // --- Training Plan Logic ---

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  const fetchTrainingPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plans = await trainerPlansApi.getPlans();
      setTrainingPlans(plans);
    } catch (error) {
      console.error("Failed to fetch training plans", error);
      toast({
        title: "Error",
        description: "Could not fetch training plans.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({ name: "", description: "", price: 0, duration: "" });
    setEditingPlan(null);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await trainerPlansApi.updatePlan(editingPlan._id, planFormData);
        toast({ title: "Success", description: "Training plan updated." });
      } else {
        await trainerPlansApi.createPlan(planFormData);
        toast({ title: "Success", description: "Training plan created." });
      }
      setIsPlanDialogOpen(false);
      resetPlanForm();
      fetchTrainingPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save training plan.",
        variant: "destructive",
      });
    }
  };

  const handleEditPlan = (plan: TrainingPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.serviceName,
      description: plan.description || "",
      price: plan.price,
      duration: plan.duration || "",
    });
    setIsPlanDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await trainerPlansApi.deletePlan(planId);
      toast({ title: "Success", description: "Training plan deleted." });
      fetchTrainingPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete training plan.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Pet Trainer Dashboard">
      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="plans">Training Plans</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="sos">SOS</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Training Sessions</h2>
          </div>

          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {session.petName} - {session.type}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Owner: {session.ownerName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {session.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dialog
                        onOpenChange={(open) =>
                          !open && setSelectedAppointment(null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAppointment(session)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>

                        {selectedAppointment && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Session Details for{" "}
                                {selectedAppointment.petName}
                              </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                              <p>
                                <strong>Owner:</strong>{" "}
                                {selectedAppointment.ownerName}
                              </p>
                              <p>
                                <strong>Time:</strong>{" "}
                                {selectedAppointment.time}
                              </p>
                              <p>
                                <strong>Type:</strong>{" "}
                                {selectedAppointment.type}
                              </p>
                              <p>
                                <strong>Status:</strong>{" "}
                                {selectedAppointment.status}
                              </p>

                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Training Video
                              </Button>

                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Add Notes
                              </Button>

                              {selectedAppointment.notes &&
                                selectedAppointment.notes.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mt-4">
                                      Previous Notes
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                      {selectedAppointment.notes.map(
                                        (note, index) => (
                                          <li key={index}>{note}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
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

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Training Plans</h2>
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPlanForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPlan ? "Edit" : "Create New"} Training Plan
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePlanSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="planName">Plan Name</Label>
                    <Input
                      id="planName"
                      placeholder="Enter plan name"
                      value={planFormData.name}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the training plan"
                      value={planFormData.description}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 6 weeks"
                      value={planFormData.duration}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={planFormData.price}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <Button className="w-full" type="submit">
                    {editingPlan ? "Update" : "Create"} Plan
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingPlans ? (
              <p>Loading plans...</p>
            ) : (
              trainingPlans.map((plan) => (
                <Card key={plan._id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">
                        {plan.serviceName}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {plan.description}
                      </p>
                      <p className="text-sm font-medium">
                        Duration: {plan.duration}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{plan.price}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPlan(plan)}
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
                                This will permanently delete the "
                                {plan.serviceName}" plan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePlan(plan._id)}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" /> Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-semibold">Quick Emergency Actions</p>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" /> Contact Pet Owner
                </Button>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 mr-2" /> Call Veterinary
                  Emergency
                </Button>

                <div className="pt-4 border-t mt-4">
                  <p className="font-semibold">Emergency Protocols</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Immediately secure the pet's safety.</li>
                    <li>Contact the owner via app notifications.</li>
                    <li>If medical emergency, call nearest vet clinic.</li>
                    <li>Document incident with photos if safe.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Emergency Report Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Use this form to report any emergency situations during a walk
                  or related to a pet.
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
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Settings</h2>

          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal-info">
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="general-settings">
                General Information
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal-info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onSavePersonalInfo)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="trainerName">Trainer Name</Label>
                      <Input id="trainerName" {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...register("email")} />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
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
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" {...register("address")} />
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

            <TabsContent value="general-settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Service & Business Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-500" /> Service
                      Options
                    </h3>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="video-consult"
                        className="flex flex-col space-y-1"
                      >
                        <span>Enable Video Consultations</span>
                        <span className="font-normal leading-snug text-muted-foreground text-sm">
                          Allow clients to book online video sessions.
                        </span>
                      </Label>
                      <Switch
                        id="video-consult"
                        checked={videoConsultEnabled}
                        onCheckedChange={setVideoConsultEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="emergency-services"
                        className="flex flex-col space-y-1"
                      >
                        <span>Enable Emergency Services</span>
                        <span className="font-normal leading-snug text-muted-foreground text-sm">
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

                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" /> Business
                      Availability
                    </h3>
                    <div>
                      <Label htmlFor="businessHours">Business Hours</Label>
                      <Input
                        id="businessHours"
                        value={businessHours}
                        onChange={(e) => setBusinessHours(e.target.value)}
                        placeholder="e.g., Mon-Fri, 9 AM - 5 PM"
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceAreas">Service Areas</Label>
                      <Input
                        id="serviceAreas"
                        value={serviceAreas}
                        onChange={(e) => setServiceAreas(e.target.value)}
                        placeholder="e.g., Pune, Mumbai, Nagpur"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" /> Policies
                    </h3>
                    <div>
                      <Label htmlFor="cancellationPolicy">
                        Cancellation Policy
                      </Label>
                      <Textarea
                        id="cancellationPolicy"
                        value={cancellationPolicy}
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                        placeholder="Detail your cancellation policy here..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-500" /> Notification
                      Preferences
                    </h3>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="email-notifications"
                        className="flex flex-col space-y-1"
                      >
                        <span>Email Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground text-sm">
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
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="sms-notifications"
                        className="flex flex-col space-y-1"
                      >
                        <span>SMS Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground text-sm">
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

                  <Button className="w-full" onClick={handleSaveChanges}>
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
