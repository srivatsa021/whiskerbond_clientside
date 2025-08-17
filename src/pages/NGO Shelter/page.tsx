import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdoptablePets, AdoptionWorkflow, Finances, SOS, Settings } from ".";

const NGOShelterDashboard = () => {
  return (
    <DashboardLayout title="NGO/Shelter Dashboard">
      <Tabs defaultValue="pets" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="pets" className="text-xs md:text-sm py-2">
            Adoptable Pets
          </TabsTrigger>
          <TabsTrigger value="adoption" className="text-xs md:text-sm py-2">
            Adoption Workflow
          </TabsTrigger>
          <TabsTrigger value="finance" className="text-xs md:text-sm py-2">
            Finances
          </TabsTrigger>
          <TabsTrigger value="sos" className="text-xs md:text-sm py-2">
            SOS
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm py-2">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pets">
          <AdoptablePets />
        </TabsContent>

        <TabsContent value="adoption">
          <AdoptionWorkflow />
        </TabsContent>

        <TabsContent value="finance">
          <Finances />
        </TabsContent>

        <TabsContent value="sos">
          <SOS />
        </TabsContent>

        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default NGOShelterDashboard;
