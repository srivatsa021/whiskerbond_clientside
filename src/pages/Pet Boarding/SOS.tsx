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
      <h2 className="text-lg md:text-2xl font-bold">SOS Emergency System</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Emergency Contacts Card */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold text-sm md:text-base mb-2">
              Quick Emergency Actions
            </h4>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-red-500 hover:bg-red-600 text-white text-sm md:text-base">
                <Phone className="h-4 w-4 mr-2" />
                Contact Pet Owner
              </Button>
              <Button className="w-full justify-start bg-red-500 hover:bg-red-600 text-white text-sm md:text-base">
                <Stethoscope className="h-4 w-4 mr-2" />
                Call Veterinary Emergency
              </Button>
            </div>
            <h4 className="font-semibold text-sm md:text-base mt-4 mb-2">
              Emergency Protocols
            </h4>
            <ul className="list-disc list-inside text-xs md:text-sm text-gray-700 space-y-1">
              <li>Immediately secure the pet's safety.</li>
              <li>Contact the owner via app notification.</li>
              <li>If medical emergency, call nearest vet clinic.</li>
              <li>Document incident with photos if safe.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Report Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-4 w-4 md:h-5 md:w-5" />
              Emergency Report Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs md:text-sm text-gray-600">
              Use this form to report any emergency situations during boarding
              or related to a pet.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="incidentType" className="text-sm">
                  Incident Type
                </Label>
                <Input
                  id="incidentType"
                  placeholder="e.g., Pet injury, lost pet, etc."
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

      {/* Emergency Contact Information Section */}
      <h3 className="text-base md:text-xl font-bold mt-6">
        Emergency Contact Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="font-semibold text-sm">24/7 Vet Emergency</p>
            <p className="text-base md:text-lg font-bold text-blue-600">
              (555) 123-PETS
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              Emergency Animal Hospital
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="font-semibold text-sm">Facility Manager</p>
            <p className="text-base md:text-lg font-bold text-blue-600">
              (555) 456-MGMT
            </p>
            <p className="text-xs md:text-sm text-gray-600">24/7 On-call</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="font-semibold text-sm">Local Animal Control</p>
            <p className="text-base md:text-lg font-bold text-blue-600">
              (555) 789-CTRL
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              Animal Control Services
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SOS;
