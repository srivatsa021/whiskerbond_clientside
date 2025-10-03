import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock } from "lucide-react";
import { groomerBookingsApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Document } from "@/types/booking";

export interface GroomerAppointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  petParent: string;
  serviceId: string;
  serviceName: string;
  appointmentTime: Date;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  price: number;
  duration: string;
  userId: string;
  completedAt?: Date;
  documents?: Document[];
  createdAt: Date;
  updatedAt: Date;
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<GroomerAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<GroomerAppointment | null>(null);

  const fetchUpcoming = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const bookings = await groomerBookingsApi.getUpcomingBookings();
      setAppointments(bookings);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      if (showLoading) {
        toast({ title: "Error", description: "Failed to load appointments. Please try again.", variant: "destructive" });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming(true);
    const interval = setInterval(() => fetchUpcoming(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (appointmentId: string, status: GroomerAppointment["status"]) => {
    try {
      await groomerBookingsApi.updateStatus(appointmentId, status);
      toast({ title: "Success", description: `Appointment ${status} successfully.` });
      await fetchUpcoming(true);
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      toast({ title: "Error", description: "Failed to update appointment status.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-xl md:text-2xl font-bold">Upcoming Appointments</h2>
      </div>

      <div className="grid gap-3 md:gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">Loading appointments...</div>
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-600">No upcoming appointments in the next 7 days.</div>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.appointmentId}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex items-start md:items-center gap-3 md:gap-4">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
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
                        className={`h-4 w-4 md:h-5 md:w-5 ${
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base break-words">
                        {appointment.patientName} - {appointment.serviceName}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">Owner: {appointment.petParent}</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-gray-600">
                            {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
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
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full md:w-auto"
                        onClick={() => handleStatusUpdate(appointment.appointmentId, "in_progress")}
                      >
                        Start
                      </Button>
                    )}
                    {(appointment.status === "in_progress" || appointment.status === "confirmed") && (
                      <Button
                        size="sm"
                        className="w-full md:w-auto"
                        onClick={() => handleStatusUpdate(appointment.appointmentId, "completed")}
                      >
                        Mark Completed
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full md:w-auto" onClick={() => setSelectedAppointment(appointment)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      {selectedAppointment && (
                        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-lg md:text-xl">Appointment Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2 text-sm md:text-base">Pet Information</h4>
                                <div className="space-y-1 text-xs md:text-sm">
                                  <p className="break-words">
                                    <strong>Name:</strong> {selectedAppointment.patientName}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-sm md:text-base">Owner Information</h4>
                                <div className="space-y-1 text-xs md:text-sm">
                                  <p className="break-words">
                                    <strong>Name:</strong> {selectedAppointment.petParent}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Appointment Details</h4>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <strong>Service:</strong> {selectedAppointment.serviceName}
                                </p>
                                <p>
                                  <strong>Time:</strong> {new Date(selectedAppointment.appointmentTime).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Duration:</strong> {selectedAppointment.duration}
                                </p>
                                <p>
                                  <strong>Status:</strong> {selectedAppointment.status}
                                </p>
                                <p>
                                  <strong>Price:</strong> ₹{selectedAppointment.price}
                                </p>
                                {selectedAppointment.notes && (
                                  <p>
                                    <strong>Notes:</strong> {selectedAppointment.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {selectedAppointment.documents && selectedAppointment.documents.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Documents</h4>
                                <div className="space-y-2">
                                  {selectedAppointment.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <span className="text-sm capitalize">{doc.type}</span>
                                      <span className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
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
    </div>
  );
};

export default Appointments;
