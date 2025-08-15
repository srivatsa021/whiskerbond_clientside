import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ServiceManager } from "@/components/services/ServiceManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  FileText,
  Video,
  Plus,
  Clock,
  Stethoscope,
  Upload,
  DollarSign,
  CreditCard,
  User,
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
import { useAuth } from "@/contexts/AuthContext";
import { authApi, vetProfileApi, vetBookingsApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { VetAppointment, AppointmentFormData } from "@/types/booking";

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

const VetDashboard = () => {
  const { user, setUser } = useAuth();

  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [videoConsultEnabled, setVideoConsultEnabled] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<VetAppointment | null>(null);
  const [emergencyServicesEnabled, setEmergencyServicesEnabled] =
    useState(true);
  const [completionFormData, setCompletionFormData] = useState<AppointmentFormData>({});

  const [selectedMonth, setSelectedMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State for general settings form
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
      fetchTodaysAppointments();
    }
  }, [user, reset]);

  const fetchTodaysAppointments = async () => {
    try {
      setLoading(true);
      const bookings = await vetBookingsApi.getUpcomingBookings();
      setAppointments(bookings);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await vetBookingsApi.updateStatus(appointmentId, status);
      toast({
        title: "Success",
        description: `Appointment ${status} successfully.`,
      });
      // Refresh appointments
      await fetchTodaysAppointments();
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await vetBookingsApi.completeAppointment(selectedAppointment.appointmentId, completionFormData);
      toast({
        title: "Success",
        description: "Appointment completed successfully.",
      });
      setSelectedAppointment(null);
      setCompletionFormData({});
      // Refresh appointments
      await fetchTodaysAppointments();
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      toast({
        title: "Error",
        description: "Failed to complete appointment.",
        variant: "destructive",
      });
    }
  };

  const handleUploadDocument = async (type: string, url: string) => {
    if (!selectedAppointment) return;

    try {
      await vetBookingsApi.uploadDocument(selectedAppointment.appointmentId, { type: type as any, url });
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });
      // Refresh appointment details
      const updatedAppointment = await vetBookingsApi.getBooking(selectedAppointment.appointmentId);
      setSelectedAppointment(updatedAppointment);
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Veterinary Hospital Dashboard">
      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="finance">Finances</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading appointments...</div>
                </CardContent>
              </Card>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-600">
                    No upcoming appointments in the next 7 days.
                  </div>
                </CardContent>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.appointmentId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          appointment.status === "completed" ? "bg-green-100" :
                          appointment.status === "in_progress" ? "bg-yellow-100" :
                          appointment.status === "confirmed" ? "bg-blue-100" :
                          "bg-gray-100"
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            appointment.status === "completed" ? "text-green-600" :
                            appointment.status === "in_progress" ? "text-yellow-600" :
                            appointment.status === "confirmed" ? "text-blue-600" :
                            "text-gray-600"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {appointment.patientName} - {appointment.serviceName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Owner: {appointment.petParent}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(appointment.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === "completed" ? "bg-green-100 text-green-800" :
                              appointment.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                              appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {appointment.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(appointment.appointmentId, "in_progress")}
                          >
                            Start
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          {selectedAppointment && (
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Appointment Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Pet and Owner Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Pet Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Name:</strong> {selectedAppointment.patientName}</p>
                                      {selectedAppointment.symptoms && (
                                        <p><strong>Symptoms:</strong> {selectedAppointment.symptoms}</p>
                                      )}
                                      {selectedAppointment.isEmergency && (
                                        <p><strong>Emergency:</strong> <span className="text-red-600">Yes</span></p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Owner Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><strong>Name:</strong> {selectedAppointment.petParent}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Appointment Details */}
                                <div>
                                  <h4 className="font-semibold mb-2">Appointment Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Service:</strong> {selectedAppointment.serviceName}</p>
                                    <p><strong>Time:</strong> {new Date(selectedAppointment.appointmentTime).toLocaleString()}</p>
                                    <p><strong>Duration:</strong> {selectedAppointment.duration}</p>
                                    <p><strong>Status:</strong> {selectedAppointment.status}</p>
                                    <p><strong>Price:</strong> ₹{selectedAppointment.price}</p>
                                    {selectedAppointment.notes && (
                                      <p><strong>Notes:</strong> {selectedAppointment.notes}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Completion Form - Only show if appointment is in progress */}
                                {selectedAppointment.status === "in_progress" && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Complete Appointment</h4>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="diagnosis">Diagnosis</Label>
                                        <Textarea
                                          id="diagnosis"
                                          placeholder="Enter diagnosis"
                                          value={completionFormData.diagnosis || ""}
                                          onChange={(e) => setCompletionFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="treatment">Treatment</Label>
                                        <Textarea
                                          id="treatment"
                                          placeholder="Enter treatment details"
                                          value={completionFormData.treatment || ""}
                                          onChange={(e) => setCompletionFormData(prev => ({ ...prev, treatment: e.target.value }))}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="prescription">Prescription Instructions</Label>
                                        <Textarea
                                          id="prescription"
                                          placeholder="Enter prescription instructions"
                                          value={completionFormData.prescription?.instructions || ""}
                                          onChange={(e) => setCompletionFormData(prev => ({ 
                                            ...prev, 
                                            prescription: { 
                                              ...prev.prescription, 
                                              instructions: e.target.value 
                                            } 
                                          }))}
                                        />
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="followUp"
                                          checked={completionFormData.followUpRequired || false}
                                          onCheckedChange={(checked) => setCompletionFormData(prev => ({ 
                                            ...prev, 
                                            followUpRequired: checked 
                                          }))}
                                        />
                                        <Label htmlFor="followUp">Follow-up required</Label>
                                      </div>
                                      {completionFormData.followUpRequired && (
                                        <div>
                                          <Label htmlFor="followUpDate">Follow-up Date</Label>
                                          <Input
                                            id="followUpDate"
                                            type="date"
                                            value={completionFormData.followUpDate || ""}
                                            onChange={(e) => setCompletionFormData(prev => ({ 
                                              ...prev, 
                                              followUpDate: e.target.value 
                                            }))}
                                          />
                                        </div>
                                      )}
                                      <Button 
                                        onClick={handleCompleteAppointment}
                                        className="w-full"
                                      >
                                        Complete Appointment
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Show completion details if already completed */}
                                {selectedAppointment.status === "completed" && selectedAppointment.diagnosis && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3">Completed Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><strong>Completed At:</strong> {selectedAppointment.completedAt ? new Date(selectedAppointment.completedAt).toLocaleString() : 'N/A'}</p>
                                      {selectedAppointment.diagnosis && (
                                        <p><strong>Diagnosis:</strong> {selectedAppointment.diagnosis}</p>
                                      )}
                                      {selectedAppointment.treatment && (
                                        <p><strong>Treatment:</strong> {selectedAppointment.treatment}</p>
                                      )}
                                      {selectedAppointment.prescription?.instructions && (
                                        <p><strong>Prescription:</strong> {selectedAppointment.prescription.instructions}</p>
                                      )}
                                      {selectedAppointment.followUpRequired && (
                                        <p><strong>Follow-up Required:</strong> Yes {selectedAppointment.followUpDate && `(on ${new Date(selectedAppointment.followUpDate).toLocaleDateString()})`}</p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="flex-1 justify-start"
                                    onClick={() => {
                                      // Simulate file upload for demo
                                      const mockUrl = `https://example.com/prescription_${selectedAppointment.appointmentId}.pdf`;
                                      handleUploadDocument("prescription", mockUrl);
                                    }}
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Prescription
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 justify-start"
                                    onClick={() => {
                                      // Simulate file upload for demo
                                      const mockUrl = `https://example.com/receipt_${selectedAppointment.appointmentId}.pdf`;
                                      handleUploadDocument("receipt", mockUrl);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Upload Receipt
                                  </Button>
                                </div>

                                {/* Documents */}
                                {selectedAppointment.documents && selectedAppointment.documents.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Documents</h4>
                                    <div className="space-y-2">
                                      {selectedAppointment.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                          <span className="text-sm capitalize">{doc.type}</span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(doc.uploadedAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
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
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServiceManager serviceType="vet" />
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

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Settings</h2>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="personal-info">
                Personal Information
              </TabsTrigger>
            </TabsList>

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
                      onCheckedChange={handleEmergencyServicesToggle}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hospital Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hospitalName">Hospital Name</Label>
                    <Input
                      id="hospitalName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="license">License Number</Label>
                    <Input id="license" placeholder="Enter license number" />
                  </div>
                  <div>
                    <Label htmlFor="emergencyHours">Emergency Hours</Label>
                    <Textarea
                      id="emergencyHours"
                      placeholder="Describe emergency availability"
                      defaultValue="24/7 emergency services available"
                    />
                  </div>
                  <Button onClick={handleSaveProfileChanges}>
                    Save Profile Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

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
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && (
                        <p className="text-sm text-red-600">
                          {errors.name.message}
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
                      <Label htmlFor="hospitalAddress">Hospital Address</Label>
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
          </Tabs>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default VetDashboard;
