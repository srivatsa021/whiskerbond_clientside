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
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="finance">Finances</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
