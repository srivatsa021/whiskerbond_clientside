// localStorage fallback utilities for demo mode when API is unavailable

interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  category: string;
  isActive: boolean;
  businessType: string;
  userId: string;
  createdAt: string;
  [key: string]: any;
}

const SERVICES_KEY = "petServiceServices";

export const localStorageApi = {
  // Services
  getServices: (userId: string): Service[] => {
    const allServices = JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]");
    return allServices.filter((service: Service) => service.userId === userId);
  },

  createService: (serviceData: any, userId: string): Service => {
    const allServices = JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]");
    const newService: Service = {
      ...serviceData,
      _id: Date.now().toString(),
      userId,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    allServices.push(newService);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(allServices));
    return newService;
  },

  updateService: (
    serviceId: string,
    serviceData: any,
    userId: string,
  ): Service | null => {
    const allServices = JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]");
    const serviceIndex = allServices.findIndex(
      (service: Service) =>
        service._id === serviceId && service.userId === userId,
    );

    if (serviceIndex === -1) return null;

    allServices[serviceIndex] = {
      ...allServices[serviceIndex],
      ...serviceData,
    };
    localStorage.setItem(SERVICES_KEY, JSON.stringify(allServices));
    return allServices[serviceIndex];
  },

  deleteService: (serviceId: string, userId: string): boolean => {
    const allServices = JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]");
    const filteredServices = allServices.filter(
      (service: Service) =>
        !(service._id === serviceId && service.userId === userId),
    );

    if (filteredServices.length === allServices.length) return false;

    localStorage.setItem(SERVICES_KEY, JSON.stringify(filteredServices));
    return true;
  },

  toggleServiceActive: (serviceId: string, userId: string): Service | null => {
    const allServices = JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]");
    const serviceIndex = allServices.findIndex(
      (service: Service) =>
        service._id === serviceId && service.userId === userId,
    );

    if (serviceIndex === -1) return null;

    allServices[serviceIndex].isActive = !allServices[serviceIndex].isActive;
    localStorage.setItem(SERVICES_KEY, JSON.stringify(allServices));
    return allServices[serviceIndex];
  },
};
