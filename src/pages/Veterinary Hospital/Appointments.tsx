import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Plus, Upload, FileText } from "lucide-react";
import { vetBookingsApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { VetAppointment, AppointmentFormData } from "@/types/booking";

const Appointments = () => {
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<VetAppointment | null>(null);
  const [completionFormData, setCompletionFormData] =
    useState<AppointmentFormData>({});

  useEffect(() => {
    fetchTodaysAppointments();
  }, []);

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
      await vetBookingsApi.completeAppointment(
        selectedAppointment.appointmentId,
        completionFormData
      );
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
      await vetBookingsApi.uploadDocument(selectedAppointment.appointmentId, {
        type: type as any,
        url,
      });
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      });
      // Refresh appointment details
      const updatedAppointment = await vetBookingsApi.getBooking(
        selectedAppointment.appointmentId
      );
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
    <div className="space-y-6">
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
                    <div
                      className={`p-2 rounded-lg ${
                        appointment.status === "completed"
                          ? "bg-green-100"
                          : appointment.status === "in_progress"
                            ? "bg-yellow-100"
                            : appointment.status === "confirmed"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                      }`}
                    >
                      <Calendar
                        className={`h-5 w-5 ${
                          appointment.status === "completed"
                            ? "text-green-600"
                            : appointment.status === "in_progress"
                              ? "text-yellow-600"
                              : appointment.status === "confirmed"
                                ? "text-blue-600"
                                : "text-gray-600"
                        }`}
                      />
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
                          {new Date(
                            appointment.appointmentTime
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
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
                        onClick={() =>
                          handleStatusUpdate(
                            appointment.appointmentId,
                            "in_progress"
                          )
                        }
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
                                <h4 className="font-semibold mb-2">
                                  Pet Information
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedAppointment.patientName}
                                  </p>
                                  {selectedAppointment.symptoms && (
                                    <p>
                                      <strong>Symptoms:</strong>{" "}
                                      {selectedAppointment.symptoms}
                                    </p>
                                  )}
                                  {selectedAppointment.isEmergency && (
                                    <p>
                                      <strong>Emergency:</strong>{" "}
                                      <span className="text-red-600">Yes</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Owner Information
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedAppointment.petParent}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Appointment Details */}
                            <div>
                              <h4 className="font-semibold mb-2">
                                Appointment Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <strong>Service:</strong>{" "}
                                  {selectedAppointment.serviceName}
                                </p>
                                <p>
                                  <strong>Time:</strong>{" "}
                                  {new Date(
                                    selectedAppointment.appointmentTime
                                  ).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Duration:</strong>{" "}
                                  {selectedAppointment.duration}
                                </p>
                                <p>
                                  <strong>Status:</strong>{" "}
                                  {selectedAppointment.status}
                                </p>
                                <p>
                                  <strong>Price:</strong> ₹
                                  {selectedAppointment.price}
                                </p>
                                {selectedAppointment.notes && (
                                  <p>
                                    <strong>Notes:</strong>{" "}
                                    {selectedAppointment.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Completion Form - Only show if appointment is in progress */}
                            {selectedAppointment.status === "in_progress" && (
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">
                                  Complete Appointment
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="diagnosis">Diagnosis</Label>
                                    <Textarea
                                      id="diagnosis"
                                      placeholder="Enter diagnosis"
                                      value={completionFormData.diagnosis || ""}
                                      onChange={(e) =>
                                        setCompletionFormData((prev) => ({
                                          ...prev,
                                          diagnosis: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="treatment">Treatment</Label>
                                    <Textarea
                                      id="treatment"
                                      placeholder="Enter treatment details"
                                      value={completionFormData.treatment || ""}
                                      onChange={(e) =>
                                        setCompletionFormData((prev) => ({
                                          ...prev,
                                          treatment: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="prescription">
                                      Prescription Instructions
                                    </Label>
                                    <Textarea
                                      id="prescription"
                                      placeholder="Enter prescription instructions"
                                      value={
                                        completionFormData.prescription
                                          ?.instructions || ""
                                      }
                                      onChange={(e) =>
                                        setCompletionFormData((prev) => ({
                                          ...prev,
                                          prescription: {
                                            ...prev.prescription,
                                            instructions: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="followUp"
                                      checked={
                                        completionFormData.followUpRequired ||
                                        false
                                      }
                                      onCheckedChange={(checked) =>
                                        setCompletionFormData((prev) => ({
                                          ...prev,
                                          followUpRequired: checked,
                                        }))
                                      }
                                    />
                                    <Label htmlFor="followUp">
                                      Follow-up required
                                    </Label>
                                  </div>
                                  {completionFormData.followUpRequired && (
                                    <div>
                                      <Label htmlFor="followUpDate">
                                        Follow-up Date
                                      </Label>
                                      <Input
                                        id="followUpDate"
                                        type="date"
                                        value={
                                          completionFormData.followUpDate || ""
                                        }
                                        onChange={(e) =>
                                          setCompletionFormData((prev) => ({
                                            ...prev,
                                            followUpDate: e.target.value,
                                          }))
                                        }
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
                            {selectedAppointment.status === "completed" &&
                              selectedAppointment.diagnosis && (
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-3">
                                    Completed Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Completed At:</strong>{" "}
                                      {selectedAppointment.completedAt
                                        ? new Date(
                                            selectedAppointment.completedAt
                                          ).toLocaleString()
                                        : "N/A"}
                                    </p>
                                    {selectedAppointment.diagnosis && (
                                      <p>
                                        <strong>Diagnosis:</strong>{" "}
                                        {selectedAppointment.diagnosis}
                                      </p>
                                    )}
                                    {selectedAppointment.treatment && (
                                      <p>
                                        <strong>Treatment:</strong>{" "}
                                        {selectedAppointment.treatment}
                                      </p>
                                    )}
                                    {selectedAppointment.prescription
                                      ?.instructions && (
                                      <p>
                                        <strong>Prescription:</strong>{" "}
                                        {
                                          selectedAppointment.prescription
                                            .instructions
                                        }
                                      </p>
                                    )}
                                    {selectedAppointment.followUpRequired && (
                                      <p>
                                        <strong>Follow-up Required:</strong> Yes{" "}
                                        {selectedAppointment.followUpDate &&
                                          `(on ${new Date(selectedAppointment.followUpDate).toLocaleDateString()})`}
                                      </p>
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
                            {selectedAppointment.documents &&
                              selectedAppointment.documents.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Documents
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedAppointment.documents.map(
                                      (doc, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        >
                                          <span className="text-sm capitalize">
                                            {doc.type}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(
                                              doc.uploadedAt
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )
                                    )}
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
    </div>
  );
};

export default Appointments;
