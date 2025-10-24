import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sessions, Finances, SOS, Settings } from "./index";
import Services from "./Services";

const PetTrainerDashboard = () => {
  return (
    <DashboardLayout title="Pet Trainer Dashboard">
      <Tabs defaultValue="appointments" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="appointments" className="text-xs md:text-sm py-2">
            Appointments
          </TabsTrigger>
          <TabsTrigger value="services" className="text-xs md:text-sm py-2">
            Services
          </TabsTrigger>
          <TabsTrigger value="finances" className="text-xs md:text-sm py-2">
            Finances
          </TabsTrigger>
          <TabsTrigger value="sos" className="text-xs md:text-sm py-2">
            SOS
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm py-2">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Sessions />
        </TabsContent>

        <TabsContent value="services">
          <Services />
        </TabsContent>

        <TabsContent value="finances">
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

export default PetTrainerDashboard;
