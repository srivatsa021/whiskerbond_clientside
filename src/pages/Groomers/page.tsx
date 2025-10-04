import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Services from "./Services";
import GroomerSettings from "./Settings";
import Appointments from "./Appointments";
import Finances from "./Finances";

const GroomersPage = () => {
  const [activeTab, setActiveTab] = useState("appointments");

  return (
    <DashboardLayout title="Groomer Dashboard">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 md:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="appointments" className="text-xs md:text-sm h-8 md:h-10">Appointments</TabsTrigger>
          <TabsTrigger value="services" className="text-xs md:text-sm h-8 md:h-10">Services</TabsTrigger>
          <TabsTrigger value="finances" className="text-xs md:text-sm h-8 md:h-10">Finances</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm h-8 md:h-10">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <Appointments />
        </TabsContent>
        <TabsContent value="services">
          <Services />
        </TabsContent>
        <TabsContent value="finances">
          <Finances />
        </TabsContent>
        <TabsContent value="settings">
          <GroomerSettings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default GroomersPage;
