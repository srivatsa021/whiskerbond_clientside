import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Phone, Stethoscope, FileText } from "lucide-react";

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
      <h2 className="text-lg md:text-2xl font-bold">SOS</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold text-sm md:text-base">
              Quick Emergency Actions
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm md:text-base">
                <Phone className="h-4 w-4 mr-2" />
                Contact Pet Owner
              </Button>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm md:text-base">
                <Stethoscope className="h-4 w-4 mr-2" />
                Call Veterinary Emergency
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="font-semibold text-sm md:text-base mb-3">
                Emergency Protocols
              </p>
              <ul className="list-disc list-inside text-xs md:text-sm text-gray-700 space-y-2">
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5" />
              Emergency Report Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs md:text-sm text-gray-600">
              Use this form to report any emergency situations during training
              or related to a pet.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="incidentType" className="text-sm">
                  Incident Type
                </Label>
                <Input
                  id="incidentType"
                  placeholder="e.g., Pet injury, behavioral incident, etc."
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the emergency situation..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  rows={3}
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
    </div>
  );
};

export default SOS;
