import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointments, Services, Finances, VetSettings } from "./index";

const VetHospitalPage = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  return (
    <DashboardLayout title="Veterinary Hospital Dashboard">
      {/* Main Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-2 md:space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
          <TabsTrigger
            value="appointments"
            className="text-xs md:text-sm h-8 md:h-10"
          >
            Appointments
          </TabsTrigger>
          <TabsTrigger
            value="services"
            className="text-xs md:text-sm h-8 md:h-10"
          >
            Services
          </TabsTrigger>
          <TabsTrigger
            value="finance"
            className="text-xs md:text-sm h-8 md:h-10"
          >
            Finances
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-xs md:text-sm h-8 md:h-10"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Appointments />
        </TabsContent>

        <TabsContent value="services">
          <Services />
        </TabsContent>

        <TabsContent value="finance">
          <Finances />
        </TabsContent>

        <TabsContent value="settings">
          <VetSettings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default VetHospitalPage;
