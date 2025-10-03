import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { servicesApi, vetServicesApi, groomerServicesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Service {
  _id: string;
  name: string;
  serviceName?: string;
  description?: string;
  price: number;
  duration?: string;
  category: string;
  isActive: boolean;
  businessType: string;
  appointmentRequired?: boolean;
  isEmergency?: boolean;
  [key: string]: any; // For service-specific fields
}

interface ServiceManagerProps {
  serviceType: string;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  serviceType,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { user } = useAuth();

  const api = serviceType === "vet" ? vetServicesApi : serviceType === "groomer" ? groomerServicesApi : servicesApi;

  // Service form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    duration: "",
    category: "",
    appointmentRequired: true,
    isEmergency: false,
  });

  useEffect(() => {
    fetchServices();
  }, [serviceType]);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error("Please log in to manage services");
      }

      const data = await api.getServices();
      setServices(
        data.map((s: any) => ({ ...s, name: s.serviceName || s.name }))
      );
    } catch (error: any) {
      console.error("Failed to fetch services", error);

      let errorMessage = "Failed to load services";
      if (error.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.status === 404) {
        errorMessage = serviceType === "vet"
          ? "Vet profile not found. Please set up your veterinary profile first."
          : "Profile not found. Please set up your business profile first.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      duration: "",
      category: "",
      appointmentRequired: true,
      isEmergency: false,
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      if (editingService) {
        await api.updateService(editingService._id, formData);
        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        await api.createService(formData);
        toast({
          title: "Success",
          description: "Service created successfully",
        });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.serviceName || service.name,
      description: service.description || "",
      price: service.price,
      duration: service.duration || "",
      category: service.category,
      appointmentRequired:
        service.appointmentRequired !== undefined
          ? service.appointmentRequired
          : true,
      isEmergency: service.isEmergency || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!user?.id) return;

    try {
      await api.deleteService(serviceId);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      fetchServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const getServiceCategories = () => {
    switch (serviceType) {
      case "vet":
        return [
          "General Checkup",
          "Vaccination",
          "Surgery",
          "Dental Care",
          "Emergency",
          "Consultation",
        ];
      // Other cases remain the same
      default:
        return ["General"];
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading services...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center space-y-4">
        <div className="text-red-600">{error}</div>
        <Button onClick={fetchServices} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h3 className="text-lg font-semibold">Service Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full md:w-auto" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Form fields remain largely the same, but now map to formData state */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name" className="text-sm">
                    Service Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-sm">
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceType === "vet" && (
                  <div>
                    <Label htmlFor="category" className="text-sm">
                      Category
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {getServiceCategories().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="duration" className="text-sm">
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 30 min, 1 hour"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              {serviceType === "vet" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isEmergency}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isEmergency: checked })
                      }
                    />
                    <Label className="text-sm">Emergency Service</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.appointmentRequired}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          appointmentRequired: checked,
                        })
                      }
                    />
                    <Label className="text-sm">Requires Appointment</Label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingService ? "Update" : "Create"} Service
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{service.description}</p>
                <div className="flex justify-between">
                  <span className="font-semibold text-green-600">
                    ${service.price}
                  </span>
                  {service.duration && (
                    <span className="text-sm text-gray-500">
                      {service.duration}
                    </span>
                  )}
                </div>
                {serviceType === "vet" && service.category && (
                  <Badge variant="outline">{service.category}</Badge>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[90vw] max-w-sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          This action cannot be undone. This will permanently
                          delete the "{service.name}" service.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex gap-2">
                        <AlertDialogCancel className="flex-1 text-sm">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(service._id)}
                          className="flex-1 text-sm"
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No services added yet.</p>
          <p className="text-sm text-gray-400">
            Click "Add Service" to create your first service.
          </p>
        </div>
      )}
    </div>
  );
};
