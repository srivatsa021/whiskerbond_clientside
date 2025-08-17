import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailySchedule, Finances, SOS, Settings } from ".";

const PetWalkerDashboard = () => {
  return (
    <DashboardLayout title="Pet Walker Dashboard">
      <Tabs defaultValue="schedule" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="schedule" className="text-xs md:text-sm py-2">
            Daily Schedule
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

        <TabsContent value="schedule" className="space-y-4 md:space-y-6">
          <DailySchedule />
        </TabsContent>

        <TabsContent value="finances" className="space-y-4 md:space-y-6">
          <Finances />
        </TabsContent>

        <TabsContent value="sos" className="space-y-4 md:space-y-6">
          <SOS />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 md:space-y-6">
          <Settings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PetWalkerDashboard;
