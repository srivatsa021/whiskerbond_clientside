import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Heart, Plus, Users, Edit, Trash2 } from "lucide-react";
import { ngoPetsApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface PetProfile {
  _id: string;
  petName: string;
  species: string;
  breed?: string;
  age?: string;
  description?: string;
  status: "available" | "pending" | "adopted";
  medicalHistory?: { date: string; description: string }[];
  applications?: number;
}

const AdoptablePets = () => {
  const [adoptablePets, setAdoptablePets] = useState<PetProfile[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [petFormData, setPetFormData] = useState({
    petName: "",
    species: "",
    breed: "",
    age: "",
    description: "",
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "adopted":
        return <Badge className="bg-blue-100 text-blue-800">Adopted</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setIsLoadingPets(true);
    try {
      const pets = await ngoPetsApi.getPets();
      setAdoptablePets(pets);
    } catch (error) {
      console.error("Failed to fetch pets", error);
      toast({
        title: "Error",
        description: "Could not fetch pets.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPets(false);
    }
  };

  const resetPetForm = () => {
    setPetFormData({
      petName: "",
      species: "",
      breed: "",
      age: "",
      description: "",
    });
    setEditingPet(null);
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await ngoPetsApi.updatePet(editingPet._id, petFormData);
        toast({ title: "Success", description: "Pet profile updated." });
      } else {
        await ngoPetsApi.createPet(petFormData);
        toast({ title: "Success", description: "Pet profile created." });
      }
      setIsPetDialogOpen(false);
      resetPetForm();
      fetchPets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save pet profile.",
        variant: "destructive",
      });
    }
  };

  const handleEditPet = (pet: PetProfile) => {
    setEditingPet(pet);
    setPetFormData({
      petName: pet.petName,
      species: pet.species,
      breed: pet.breed || "",
      age: pet.age || "",
      description: pet.description || "",
    });
    setIsPetDialogOpen(true);
  };

  const handleDeletePet = async (petId: string) => {
    try {
      await ngoPetsApi.deletePet(petId);
      toast({ title: "Success", description: "Pet profile deleted." });
      fetchPets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete pet profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <h2 className="text-lg md:text-2xl font-bold">
          Adoptable Pet Profiles
        </h2>
        <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetPetForm}
              className="w-full md:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingPet ? "Edit" : "Add New"} Pet Profile
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePetSubmit} className="space-y-3">
              <div>
                <Label htmlFor="petName" className="text-sm">
                  Pet Name
                </Label>
                <Input
                  id="petName"
                  placeholder="Enter pet name"
                  value={petFormData.petName}
                  onChange={(e) =>
                    setPetFormData({
                      ...petFormData,
                      petName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="species" className="text-sm">
                  Species
                </Label>
                <Select
                  value={petFormData.species}
                  onValueChange={(value) =>
                    setPetFormData({ ...petFormData, species: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breed" className="text-sm">
                  Breed
                </Label>
                <Input
                  id="breed"
                  placeholder="Enter breed"
                  value={petFormData.breed}
                  onChange={(e) =>
                    setPetFormData({
                      ...petFormData,
                      breed: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-sm">
                  Age
                </Label>
                <Input
                  id="age"
                  placeholder="e.g., 2 years"
                  value={petFormData.age}
                  onChange={(e) =>
                    setPetFormData({ ...petFormData, age: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the pet's personality and characteristics..."
                  value={petFormData.description}
                  onChange={(e) =>
                    setPetFormData({
                      ...petFormData,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPetDialogOpen(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  {editingPet ? "Update" : "Add"} Pet Profile
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {isLoadingPets ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-sm md:text-base">
                  Loading pets...
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          adoptablePets.map((pet) => (
            <Card key={pet._id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                    <CardTitle className="text-sm md:text-lg truncate">
                      {pet.petName}
                    </CardTitle>
                  </div>
                  {getStatusBadge(pet.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Species:</span> {pet.species}
                  </p>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Breed:</span> {pet.breed}
                  </p>
                  <p className="text-xs md:text-sm">
                    <span className="font-medium">Age:</span> {pet.age}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {pet.description}
                  </p>
                  {pet.applications && pet.applications > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 p-0 h-auto text-xs md:text-sm"
                    >
                      <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      View Applications ({pet.applications})
                    </Button>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPet(pet)}
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
                            This will permanently delete the profile for{" "}
                            {pet.petName}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-2">
                          <AlertDialogCancel className="flex-1 text-sm">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePet(pet._id)}
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

export default AdoptablePets;
