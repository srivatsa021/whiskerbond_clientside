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
import { Plus, Clock, MapPin, Route, Upload, Video } from "lucide-react";

const DailySchedule = () => {
  const [walkSchedule, setWalkSchedule] = useState([
    {
      id: 1,
      petName: "Max",
      ownerName: "John Smith",
      date: "2024-07-20",
      time: "08:00 AM",
      duration: "30 min",
      status: "upcoming",
      location: "Central Park Area",
      notes: "Max is energetic in the mornings. Likes to chase squirrels.",
      type: "Walk",
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

  const [selectedWalk, setSelectedWalk] = useState<any>(null);

  const handleOpenWalkDetails = (walk: any) => {
    setSelectedWalk(walk);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">
          Today's Walking Schedule
        </h2>
        <Button className="w-full md:w-auto text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Walk
        </Button>
      </div>

      <div className="grid gap-3 md:gap-4">
        {walkSchedule.map((walk) => (
          <Card key={walk.id} className="overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Route className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">
                      {walk.petName} - {walk.duration} Walk
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      Owner: {walk.ownerName}
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-600">
                          {walk.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm text-gray-600 truncate">
                          {walk.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end md:justify-start">
                  <Dialog
                    onOpenChange={(isOpen) => !isOpen && setSelectedWalk(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenWalkDetails(walk)}
                        className="text-xs md:text-sm"
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    {selectedWalk && (
                      <DialogContent className="w-[95vw] max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-lg md:text-xl">
                            Walk Details
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2 text-sm">
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
                              <span className="font-semibold">Duration:</span>{" "}
                              {selectedWalk.duration}
                            </p>
                            <p>
                              <span className="font-semibold">Location:</span>{" "}
                              {selectedWalk.location}
                            </p>
                            <p>
                              <span className="font-semibold">Status:</span>{" "}
                              {selectedWalk.status === "upcoming"
                                ? "Confirmed"
                                : selectedWalk.status}
                            </p>
                            <p>
                              <span className="font-semibold">Notes:</span>{" "}
                              {selectedWalk.notes}
                            </p>
                          </div>
                          <div className="space-y-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              className="w-full justify-start text-sm"
                            >
                              <Upload className="h-4 w-4 mr-2" /> Upload Walk
                              Photos
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-sm"
                            >
                              <Video className="h-4 w-4 mr-2" /> View Pet
                              Profile
                            </Button>
                          </div>
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

export default DailySchedule;
