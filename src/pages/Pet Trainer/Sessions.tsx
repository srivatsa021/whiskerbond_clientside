import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Clock, Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { trainerBookingsApi } from "@/lib/api";

const Sessions = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [extendDays, setExtendDays] = useState<number>(7);
  const [extendTimeOfDay, setExtendTimeOfDay] = useState<string>("");
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);
  const [sessionProgressNotes, setSessionProgressNotes] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<"pending" | "completed" | "missed">("completed");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await trainerBookingsApi.getBookings();
      setAppointments(data || []);
    } catch (e) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateSession = async (apt: any, idx: number, status: "pending" | "completed" | "missed", progressNotes: string = "") => {
    try {
      const updated = await trainerBookingsApi.updateSessionStatus(apt.appointmentId, idx, status, progressNotes);
      console.log('Updated appointment data:', JSON.stringify(updated, null, 2));
      
      // Update the selected appointment with the fresh data
      setSelectedAppointment(updated);
      setEditingSessionIndex(null);
      setSessionProgressNotes("");
      
      // Also refresh the appointments list to keep everything in sync
      await refresh();
      
      // Force a re-render by updating the selected appointment again
      setTimeout(() => {
        setSelectedAppointment(updated);
      }, 100);
    } catch (err) {
      console.error("Error updating session:", err);
      alert("Failed to update session. Please try again.");
    }
  };

  const acceptAppointment = async (apt: any) => {
    try {
      const updated = await trainerBookingsApi.updateStatus(apt.appointmentId, "in_progress");
      setSelectedAppointment(updated);
      await refresh();
    } catch (e) {
      console.error("Failed to accept appointment:", e);
    }
  };

  const saveFollowUp = async () => {
    if (!selectedAppointment) return;
    try {
      const updated = await trainerBookingsApi.completeAppointment(selectedAppointment.appointmentId, {
        followUpRequired,
        ...(followUpRequired && followUpDate ? { followUpDate } : {}),
      });
      setSelectedAppointment(updated);
      await refresh();
    } catch (e) {
      console.error("Failed to save follow-up:", e);
    }
  };

  const isAllCompleted = (apt: any) => Array.isArray(apt.dayWiseStatus) && apt.dayWiseStatus.length > 0 && apt.dayWiseStatus.every((s: any) => s.status === "completed");

  const handleExtend = async () => {
    if (!selectedAppointment) return;
    const payload: { additionalDays: number; timeOfDay?: string } = { additionalDays: extendDays };
    if (extendTimeOfDay && /^\d{1,2}:\d{2}$/.test(extendTimeOfDay)) payload.timeOfDay = extendTimeOfDay;
    try {
      const updated = await trainerBookingsApi.extendBooking(selectedAppointment.appointmentId, payload);
      setSelectedAppointment(updated);
      await refresh();
    } catch (e) {
      console.error("Failed to extend booking:", e);
    }
  };

  const countCompleted = (apt: any) => (apt.dayWiseStatus || []).filter((s: any) => s.status === "completed").length;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-lg md:text-2xl font-bold">Appointments</h2>
      </div>

      {/* Training Updates Summary */}
      {(() => {
        const totals = appointments.reduce(
          (acc, apt: any) => {
            const sessions = (apt.dayWiseStatus || []) as any[];
            const completed = sessions.filter((s) => s.status === "completed");
            acc.total += sessions.length;
            acc.completed += completed.length;
            for (const s of completed) {
              const d = s.date ? new Date(s.date) : null;
              if (d && (!acc.latestDate || d > acc.latestDate)) {
                acc.latestDate = d;
                acc.latestNotes = s.progressNotes || "";
              }
            }
            return acc;
          },
          { total: 0, completed: 0, latestDate: null as Date | null, latestNotes: "" }
        );
        const percent = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;
        return totals.total > 0 ? (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">Training Updates</div>
                  <div className="text-xs text-gray-700 mt-1">
                    {totals.latestDate ? (
                      <>
                        Latest completed: {totals.latestDate.toLocaleDateString()} — {totals.latestNotes || "No notes"}
                      </>
                    ) : (
                      <>No sessions completed yet</>
                    )}
                  </div>
                </div>
                <div className="text-xs font-medium">Overall Progress: {percent}% ({totals.completed}/{totals.total})</div>
              </div>
            </CardContent>
          </Card>
        ) : null;
      })()}

      <div className="grid gap-3 md:gap-4">
        {loading ? (
          <Card><CardContent className="p-6 text-center text-sm">Loading...</CardContent></Card>
        ) : appointments.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm">No appointments</CardContent></Card>
        ) : (
          appointments.map((apt: any) => (
            <Card key={apt.appointmentId}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Award className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm md:text-base truncate">
                        {apt.petName || "Pet"} - {apt.serviceName || "Service"}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">
                        Owner: {apt.clientName || apt.petParent || ""}
                      </p>
                      <p className="text-[11px] md:text-xs text-gray-600 truncate">
                        Start: {apt.startDate ? new Date(apt.startDate).toLocaleDateString() : (apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleDateString() : "")}
                        {apt.duration ? ` • Duration: ${apt.duration}` : ""}
                        {apt.tier ? ` • Type: ${apt.tier}` : (apt.serviceType ? ` • Type: ${apt.serviceType}` : "")}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-600">
                          {apt.dailyVisitTime || apt.trainingPlan?.sessionTime || (apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString() : (apt.dayWiseStatus?.[0]?.date ? new Date(apt.dayWiseStatus[0].date).toLocaleString() : (apt.startDate ? new Date(apt.startDate).toLocaleString() : "")))}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium w-fit ml-2 ${
                            apt.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : apt.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : apt.status === "pending"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {apt.status === "in_progress" ? "Accepted" : apt.status}
                        </span>
                      </div>
                      {apt.dayWiseStatus?.length ? (
                        <div className="text-xs text-gray-700 mt-1">
                          <div>Day {countCompleted(apt)} of {apt.dayWiseStatus.length} completed</div>
                          {(() => {
                            const first = apt.dayWiseStatus[0];
                            const firstTime = first && first.date ? new Date(first.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (apt.dailyVisitTime || apt.trainingPlan?.sessionTime || (apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''));
                            return (
                              <div className="mt-1 bg-gray-50 p-2 rounded">
                                <div className="font-medium text-sm">Day 1 — {firstTime}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {first && first.status === "completed" ? (
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded">✓ Completed</span>
                                  ) : first && first.status === "missed" ? (
                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded">Missed</span>
                                  ) : (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded">Pending</span>
                                  )}
                                </div>
                                {first && first.progressNotes ? (
                                  <div className="text-xs text-gray-700 mt-2">Notes: {first.progressNotes}</div>
                                ) : null}
                              </div>
                            );
                          })()}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {apt.status === "pending" && (
                      <Button size="sm" onClick={() => acceptAppointment(apt)} className="w-full md:w-auto text-xs md:text-sm">
                        Accept
                      </Button>
                    )}
                    <Dialog onOpenChange={(open) => !open && setSelectedAppointment(null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const aptDetails = await trainerBookingsApi.getBooking(apt.appointmentId);
                              setSelectedAppointment(aptDetails);
                              if (aptDetails.timeOfDay) {
                                setExtendTimeOfDay(aptDetails.timeOfDay);
                              } else if (aptDetails.appointmentTime) {
                                const d = new Date(aptDetails.appointmentTime);
                                const hh = String(d.getHours()).padStart(2, "0");
                                const mm = String(d.getMinutes()).padStart(2, "0");
                                setExtendTimeOfDay(`${hh}:${mm}`);
                              }
                              setFollowUpRequired(!!aptDetails.followUpRequired);
                              setFollowUpDate(aptDetails.followUpDate ? new Date(aptDetails.followUpDate).toISOString().slice(0,10) : "");
                            } catch (err) {
                              console.error("Error loading appointment details:", err);
                              setSelectedAppointment(apt);
                            }
                          }}
                          className="w-full md:w-auto text-xs md:text-sm"
                        >
                          View Details
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg">
                            {selectedAppointment?.petName || "Pet"} - {selectedAppointment?.clientName || selectedAppointment?.petParent || "Owner"}
                          </DialogTitle>
                          <DialogDescription>
                            Training appointment details and session progress
                          </DialogDescription>
                        </DialogHeader>
                        {selectedAppointment ? (
                          <>

                            <div className="space-y-3">
                              {selectedAppointment.status === "pending" && (
                                <div className="flex justify-end">
                                  <Button size="sm" onClick={() => acceptAppointment(selectedAppointment)}>Accept Appointment</Button>
                                </div>
                              )}

                              {!((selectedAppointment.trainingPlan && Array.isArray(selectedAppointment.trainingPlan.sessionDates) && selectedAppointment.trainingPlan.sessionDates.length > 0) || (Array.isArray(selectedAppointment.sessionDates) && selectedAppointment.sessionDates.length > 0) || (Array.isArray(selectedAppointment.dayWiseStatus) && selectedAppointment.dayWiseStatus.length > 0)) ? (
                                <div className="text-center py-6 text-sm text-gray-600">
                                  <p>No training sessions available</p>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Training Sessions</h4>
                                  <div className="space-y-3">
                                    {(() => {
                                      // Prioritize dayWiseStatus since that's what the backend updates
                                      const sessionsData = selectedAppointment.dayWiseStatus && selectedAppointment.dayWiseStatus.length > 0 
                                        ? selectedAppointment.dayWiseStatus 
                                        : (selectedAppointment.trainingPlan?.sessionDates && selectedAppointment.trainingPlan.sessionDates.length > 0) 
                                          ? selectedAppointment.trainingPlan.sessionDates 
                                          : (selectedAppointment.sessionDates && selectedAppointment.sessionDates.length > 0) 
                                            ? selectedAppointment.sessionDates 
                                            : [];
                                      console.log('Sessions data being rendered:', JSON.stringify(sessionsData, null, 2));
                                      console.log('selectedAppointment.dayWiseStatus:', JSON.stringify(selectedAppointment.dayWiseStatus, null, 2));
                                      return sessionsData;
                                    })().map((s: any, i: number) => {
                                      const sessionsData = selectedAppointment.dayWiseStatus && selectedAppointment.dayWiseStatus.length > 0 
                                        ? selectedAppointment.dayWiseStatus 
                                        : (selectedAppointment.trainingPlan?.sessionDates && selectedAppointment.trainingPlan.sessionDates.length > 0) 
                                          ? selectedAppointment.trainingPlan.sessionDates 
                                          : (selectedAppointment.sessionDates && selectedAppointment.sessionDates.length > 0) 
                                            ? selectedAppointment.sessionDates 
                                            : [];
                                      const isLastDay = i === (sessionsData.length - 1);
                                      const isEditing = editingSessionIndex === i;
                                      return (
                                        <div key={i} className="border rounded p-3 space-y-2">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="font-medium text-sm">
                                                Day {i + 1} — {(s.dateTime ? new Date(s.dateTime).toLocaleDateString() : (s.date ? (typeof s.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.date) ? (() => { const [yy, mm, dd] = s.date.split("-"); return `${mm}/${dd}/${yy}`; })() : new Date(s.date).toLocaleDateString()) : ''))} {s.time || selectedAppointment.trainingPlan?.sessionTime || selectedAppointment.dailyVisitTime || ''}
                                              </div>
                                              <div className="mt-1">
                                                <div className="text-xs font-medium text-gray-700">Status</div>
                                                <div className="text-xs text-gray-600 mt-0.5">
                                                  {s.status === "completed" && (
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded">✓ Completed</span>
                                                  )}
                                                  {s.status === "pending" && (
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded">Pending</span>
                                                  )}
                                                  {s.status === "missed" && (
                                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded">Missed</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                            <div>
                                              {s.status !== "completed" && !isEditing && (
                                                <Button
                                                  size="sm"
                                                  onClick={() => {
                                                    setEditingSessionIndex(i);
                                                    setSessionProgressNotes(s.progressNotes || (s.notes as string) || "");
                                                    setSessionStatus((s.status as any) || "pending");
                                                  }}
                                                  className="text-xs md:text-sm"
                                                >
                                                  Update Progress
                                                </Button>
                                              )}
                                            </div>
                                          </div>

                                          {!isEditing && (
                                            <div className="mt-2">
                                              <div className="text-xs font-medium text-gray-700">Notes</div>
                                              <div className="text-xs text-gray-700 whitespace-pre-wrap">{s.progressNotes || (s as any).notes || ""}</div>
                                            </div>
                                          )}

                                          {isEditing && (
                                            <div className="space-y-2 mt-2 pt-2 border-t">
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                  <label className="text-xs font-medium block mb-1">Status</label>
                                                  <Select value={sessionStatus} onValueChange={(v) => setSessionStatus(v as any)}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                      <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="pending">Pending</SelectItem>
                                                      <SelectItem value="completed">Completed</SelectItem>
                                                      <SelectItem value="missed">Missed</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                                <div>
                                                  <label className="text-xs font-medium block mb-1">Notes</label>
                                                  <textarea
                                                    value={sessionProgressNotes}
                                                    onChange={(e) => setSessionProgressNotes(e.target.value)}
                                                    placeholder="Add notes for this day..."
                                                    className="w-full px-2 py-1 text-xs border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows={3}
                                                  />
                                                </div>
                                              </div>
                                              {isLastDay && s.status !== "completed" && (
                                                <div className="text-xs">
                                                  <p className="text-gray-700 mb-2 font-medium">This is the last training day. Update status and add any final notes.</p>
                                                </div>
                                              )}
                                              <div className="flex gap-2 justify-end">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => {
                                                    setEditingSessionIndex(null);
                                                    setSessionProgressNotes("");
                                                  }}
                                                  className="text-xs"
                                                >
                                                  Cancel
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  onClick={() => updateSession(selectedAppointment, i, sessionStatus, sessionProgressNotes)}
                                                  className="text-xs"
                                                >
                                                  Save Changes
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {isAllCompleted(selectedAppointment) && (
                                <div className="space-y-4 border-t pt-4">
                                  <div className="bg-green-50 border border-green-200 rounded p-3">
                                    <p className="text-sm font-semibold text-green-800">✓ All training sessions completed!</p>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-sm">Is Follow-up Training Needed?</h4>
                                    <div className="space-y-2">
                                      <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={followUpRequired}
                                          onChange={(e) => setFollowUpRequired(e.target.checked)}
                                          className="w-4 h-4 cursor-pointer"
                                        />
                                        <span className="text-sm">Yes, schedule follow-up training</span>
                                      </label>
                                      {followUpRequired && (
                                        <div className="ml-7 space-y-2">
                                          <div>
                                            <label className="text-xs font-medium block mb-1">Follow-up Date</label>
                                            <Input
                                              type="date"
                                              value={followUpDate}
                                              onChange={(e) => setFollowUpDate(e.target.value)}
                                              className="text-xs"
                                            />
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={saveFollowUp}
                                            className="text-xs"
                                          >
                                            Confirm Follow-up
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3 pt-3 border-t">
                                    <h4 className="font-semibold text-sm">Extend Training (Optional)</h4>
                                    <p className="text-xs text-gray-600">Add more sessions to continue the training program</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                                      <div>
                                        <label className="text-xs font-medium block mb-1">Number of Days</label>
                                        <Input
                                          type="number"
                                          min={1}
                                          value={extendDays}
                                          onChange={(e) => setExtendDays(parseInt(e.target.value || "0", 10))}
                                          placeholder="Days"
                                          className="text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium block mb-1">Time of Day (HH:MM)</label>
                                        <Input
                                          type="text"
                                          value={extendTimeOfDay}
                                          onChange={(e) => setExtendTimeOfDay(e.target.value)}
                                          placeholder={(selectedAppointment.timeOfDay as string) || "HH:MM"}
                                          className="text-xs"
                                        />
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={handleExtend}
                                        className="w-full text-xs"
                                      >
                                        Extend Training
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedAppointment.notes && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Notes</h4>
                                  <p className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap">{selectedAppointment.notes}</p>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6 text-sm text-gray-600">
                            <p>Loading appointment details...</p>
                          </div>
                        )}
                      </DialogContent>
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

export default Sessions;
