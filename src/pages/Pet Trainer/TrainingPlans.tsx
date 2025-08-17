import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { trainerPlansApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface TrainingPlan {
  _id: string;
  serviceName: string;
  description?: string;
  price: number;
  duration?: string;
}

const TrainingPlans = () => {
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [planFormData, setPlanFormData] = useState({
    name: "",
    description: "",
    price: 0,
    duration: "",
  });

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  const fetchTrainingPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plans = await trainerPlansApi.getPlans();
      setTrainingPlans(plans);
    } catch (error) {
      console.error("Failed to fetch training plans", error);
      toast({
        title: "Error",
        description: "Could not fetch training plans.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({ name: "", description: "", price: 0, duration: "" });
    setEditingPlan(null);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await trainerPlansApi.updatePlan(editingPlan._id, planFormData);
        toast({ title: "Success", description: "Training plan updated." });
      } else {
        await trainerPlansApi.createPlan(planFormData);
        toast({ title: "Success", description: "Training plan created." });
      }
      setIsPlanDialogOpen(false);
      resetPlanForm();
      fetchTrainingPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save training plan.",
        variant: "destructive",
      });
    }
  };

  const handleEditPlan = (plan: TrainingPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.serviceName,
      description: plan.description || "",
      price: plan.price,
      duration: plan.duration || "",
    });
    setIsPlanDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await trainerPlansApi.deletePlan(planId);
      toast({ title: "Success", description: "Training plan deleted." });
      fetchTrainingPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete training plan.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-lg md:text-2xl font-bold">Training Plans</h2>
        <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetPlanForm}
              className="w-full md:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingPlan ? "Edit" : "Create New"} Training Plan
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePlanSubmit} className="space-y-3">
              <div>
                <Label htmlFor="planName" className="text-sm">
                  Plan Name
                </Label>
                <Input
                  id="planName"
                  placeholder="Enter plan name"
                  value={planFormData.name}
                  onChange={(e) =>
                    setPlanFormData({
                      ...planFormData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the training plan"
                  value={planFormData.description}
                  onChange={(e) =>
                    setPlanFormData({
                      ...planFormData,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-sm">
                  Duration
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 6 weeks"
                  value={planFormData.duration}
                  onChange={(e) =>
                    setPlanFormData({
                      ...planFormData,
                      duration: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-sm">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={planFormData.price}
                  onChange={(e) =>
                    setPlanFormData({
                      ...planFormData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPlanDialogOpen(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingPlan ? "Update" : "Create"} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {isLoadingPlans ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-sm md:text-base">
                  Loading plans...
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          trainingPlans.map((plan) => (
            <Card key={plan._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-purple-600 flex-shrink-0" />
                  <CardTitle className="text-sm md:text-lg truncate">
                    {plan.serviceName}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-3">
                    {plan.description}
                  </p>
                  <p className="text-xs md:text-sm font-medium">
                    Duration: {plan.duration}
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    ₹{plan.price}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 text-xs md:text-sm"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs md:text-sm"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[90vw] max-w-sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">
                            Are you sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            This will permanently delete the "{plan.serviceName}
                            " plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-2">
                          <AlertDialogCancel className="flex-1 text-sm">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePlan(plan._id)}
                            className="flex-1 text-sm"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TrainingPlans;
