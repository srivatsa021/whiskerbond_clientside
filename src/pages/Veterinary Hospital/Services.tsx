import React from "react";
import { ServiceManager } from "@/components/services/ServiceManager";

const Services = () => {
  return (
    <div className="space-y-6">
      <ServiceManager serviceType="vet" />
    </div>
  );
};

export default Services;
