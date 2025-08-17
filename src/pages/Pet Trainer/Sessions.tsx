import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Upload, FileText, Award } from "lucide-react";

const Sessions = () => {
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

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-lg md:text-2xl font-bold">Training Sessions</h2>
      </div>

      <div className="grid gap-3 md:gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Award className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">
                      {session.petName} - {session.type}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      Owner: {session.ownerName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-600">
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
                        className="w-full md:w-auto text-xs md:text-sm"
                      >
                        View Details
                      </Button>
                    </DialogTrigger>

                    {selectedAppointment && (
                      <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg">
                            Session Details for {selectedAppointment.petName}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <p>
                              <strong>Owner:</strong>{" "}
                              {selectedAppointment.ownerName}
                            </p>
                            <p>
                              <strong>Time:</strong> {selectedAppointment.time}
                            </p>
                            <p>
                              <strong>Type:</strong> {selectedAppointment.type}
                            </p>
                            <p>
                              <strong>Status:</strong>{" "}
                              {selectedAppointment.status}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full justify-start text-sm"
                              size="sm"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Training Video
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full justify-start text-sm"
                              size="sm"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Add Notes
                            </Button>
                          </div>

                          {selectedAppointment.notes &&
                            selectedAppointment.notes.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2">
                                  Previous Notes
                                </h4>
                                <ul className="list-disc list-inside text-xs md:text-sm text-gray-700 space-y-1">
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
    </div>
  );
};

export default Sessions;
