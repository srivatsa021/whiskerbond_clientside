import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Phone, Stethoscope, FileText } from "lucide-react";

const SOS = () => {
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

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">SOS Emergency System</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Emergency Contacts Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 text-lg md:text-xl">
              <AlertTriangle className="h-5 w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-base md:text-lg font-semibold">
                Quick Emergency Actions
              </h3>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm md:text-base">
                <Phone className="h-4 w-4 mr-2" /> Contact Pet Owner
              </Button>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm md:text-base">
                <Stethoscope className="h-4 w-4 mr-2" /> Call Veterinary
                Emergency
              </Button>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-base md:text-lg font-semibold">
                Emergency Protocols
              </h3>
              <ul className="list-disc list-inside text-xs md:text-sm text-gray-700 space-y-1">
                <li>Immediately secure the pet's safety.</li>
                <li>Contact the owner via app notification.</li>
                <li>If medical emergency, call nearest vet clinic.</li>
                <li>Document incident with photos if safe.</li>
                <li>Stay calm and follow protocol steps.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Report Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <FileText className="h-5 w-5" />
              Emergency Report Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs md:text-sm text-gray-600">
              Use this form to report any emergency situations during a walk or
              related to a pet.
            </p>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="incidentType" className="text-sm md:text-base">
                  Incident Type
                </Label>
                <Input
                  id="incidentType"
                  placeholder="e.g., Pet injury, lost pet, etc."
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyDescription"
                  className="text-sm md:text-base"
                >
                  Description
                </Label>
                <Textarea
                  id="emergencyDescription"
                  placeholder="Describe the emergency situation..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="text-sm min-h-[100px]"
                />
              </div>

              <Button
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm md:text-base"
                onClick={handleSubmitEmergencyReport}
              >
                Submit Emergency Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contact Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Emergency Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="p-4 border rounded-lg text-center space-y-2">
              <p className="font-semibold text-sm md:text-base">
                24/7 Vet Emergency
              </p>
              <p className="text-lg md:text-xl text-red-600 font-bold">
                (555) 123-PETS
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                Emergency Animal Hospital
              </p>
            </div>

            <div className="p-4 border rounded-lg text-center space-y-2">
              <p className="font-semibold text-sm md:text-base">
                Walker Coordinator
              </p>
              <p className="text-lg md:text-xl text-red-600 font-bold">
                (555) 456-WALK
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                24/7 Support Line
              </p>
            </div>

            <div className="p-4 border rounded-lg text-center space-y-2">
              <p className="font-semibold text-sm md:text-base">
                Local Animal Control
              </p>
              <p className="text-lg md:text-xl text-red-600 font-bold">
                (555) 789-CTRL
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                Lost Pet Recovery
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SOS;
