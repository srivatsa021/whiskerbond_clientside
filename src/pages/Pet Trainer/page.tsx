import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sessions, TrainingPlans, Finances, SOS, Settings } from "./index";

const PetTrainerDashboard = () => {
  return (
    <DashboardLayout title="Pet Trainer Dashboard">
      <Tabs defaultValue="sessions" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="sessions" className="text-xs md:text-sm py-2">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="plans" className="text-xs md:text-sm py-2">
            Training Plans
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

        <TabsContent value="sessions">
          <Sessions />
        </TabsContent>

        <TabsContent value="plans">
          <TrainingPlans />
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
