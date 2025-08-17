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
import { Calendar, Upload, FileText } from "lucide-react";

const Bookings = () => {
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

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-lg md:text-2xl font-bold">Pet Boarding Schedule</h2>

      <div className="grid gap-3 md:gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm md:text-base">
                      {booking.petName} - {booking.roomType}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Owner: {booking.ownerName}
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                      <span className="text-xs md:text-sm text-gray-600">
                        Check-in: {booking.checkIn}
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">
                        Check-out: {booking.checkOut}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-orange-600 mt-1">
                      Special needs: {booking.specialNeeds}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full md:w-auto text-xs md:text-sm"
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg">
                          Booking Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2 text-sm">
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
                            <span className="font-semibold">
                              Special Needs:
                            </span>{" "}
                            {booking.specialNeeds}
                          </p>
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            className="w-full justify-start text-sm"
                            size="sm"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Prescription
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-sm"
                            size="sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Medical History
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
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

export default Bookings;
