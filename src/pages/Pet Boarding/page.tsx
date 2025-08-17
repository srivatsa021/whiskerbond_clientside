import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookings, Finances, SOS, Settings } from "./index";

const PetBoardingDashboard = () => {
  return (
    <DashboardLayout title="Pet Boarding Dashboard">
      <Tabs defaultValue="bookings" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1">
          <TabsTrigger value="bookings" className="text-xs md:text-sm py-2">
            Bookings
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

        <TabsContent value="bookings">
          <Bookings />
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

export default PetBoardingDashboard;
