import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, FileText } from "lucide-react";

const AdoptionWorkflow = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-lg md:text-2xl font-bold">
        Adoption Workflow Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Adoption Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 md:p-4 border rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-medium text-sm md:text-base">
                      Application for Shadow
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      Applicant: Jennifer Smith
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Application Date: 2024-01-15
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    Under Review
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-3">
                  <Button size="sm" className="text-xs md:text-sm">
                    Review Application
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs md:text-sm"
                  >
                    Schedule Meet & Greet
                  </Button>
                </div>
              </div>

              <div className="p-3 md:p-4 border rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                  <div>
                    <h4 className="font-medium text-sm md:text-base">
                      Application for Whiskers
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600">
                      Applicant: Mark Johnson
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Application Date: 2024-01-12
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Approved
                  </Badge>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-3">
                  <Button size="sm" className="text-xs md:text-sm">
                    Schedule Pickup
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs md:text-sm"
                  >
                    Prepare Paperwork
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adoption Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Monthly Adoption Goal
                  </span>
                  <span className="text-sm text-gray-600">8/12</span>
                </div>
                <Progress value={67} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    23
                  </p>
                  <p className="text-xs md:text-sm text-blue-800">
                    Total Adoptions
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    15
                  </p>
                  <p className="text-xs md:text-sm text-green-800">
                    Available Pets
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Adoption Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Contact Approved Families
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdoptionWorkflow;
