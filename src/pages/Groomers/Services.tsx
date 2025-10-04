import React from "react";
import { ServiceManager } from "@/components/services/ServiceManager";

const Services = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      <ServiceManager serviceType="groomer" />
    </div>
  );
};

export default Services;
