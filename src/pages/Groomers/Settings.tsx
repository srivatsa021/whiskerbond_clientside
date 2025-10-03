import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, IdCard, User, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, groomerProfileApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import PhotoManager from "@/components/profile/PhotoManager";

const GroomerSettings = () => {
  const { user, setUser } = useAuth();
  const [businessName, setBusinessName] = useState(user?.businessName || "");

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationAuthority, setRegistrationAuthority] = useState("");
  const [registrationDocumentUrl, setRegistrationDocumentUrl] = useState("");

  const [identityProofType, setIdentityProofType] = useState("");
  const [identityProofUrl, setIdentityProofUrl] = useState("");

  const [photos, setPhotos] = useState<string[]>(user?.images || []);

  useEffect(() => {
    setPhotos(user?.images || []);
  }, [user]);

  useEffect(() => {
    setBusinessName(user?.businessName || "");
  }, [user?.businessName]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await groomerProfileApi.getProfile();
        setRegistrationNumber(profile.establishmentRegistrationNumber || "");
        setRegistrationAuthority(profile.establishmentRegistrationAuthority || "");
        setRegistrationDocumentUrl(profile.establishmentRegistrationDocumentUrl || "");
        setIdentityProofType(profile.identityProofType || "");
        setIdentityProofUrl(profile.identityProofUrl || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveGeneral = async () => {
    try {
      await groomerProfileApi.updateProfile({
        establishmentRegistrationNumber: registrationNumber,
        establishmentRegistrationAuthority: registrationAuthority,
        establishmentRegistrationDocumentUrl: registrationDocumentUrl,
        identityProofType,
        identityProofUrl,
      });
      if (user && businessName && businessName !== user.businessName) {
        const updatedUser = await authApi.updateProfile({ businessName });
        setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      }
      toast({ title: "Success", description: "Groomer settings saved." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  const onSavePersonalInfo = async (data: { name?: string; email?: string; contactNo?: string; address?: string; }) => {
    if (!user) return;
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
      toast({ title: "Success", description: "Personal information updated." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to update personal information.", variant: "destructive" });
    }
  };

  const [personal, setPersonal] = useState({
    name: user?.name || "",
    email: user?.email || "",
    contactNo: user?.contactNo || "",
    address: user?.address || "",
  });

  useEffect(() => {
    if (user) {
      setPersonal({
        name: user.name,
        email: user.email,
        contactNo: user.contactNo || "",
        address: user.address,
      });
    }
  }, [user]);

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">Settings</h2>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="general" className="text-xs md:text-sm h-8 md:h-10">General Settings</TabsTrigger>
          <TabsTrigger value="personal-info" className="text-xs md:text-sm h-8 md:h-10">Personal Information</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <FileText className="h-4 w-4 md:h-5 md:w-5" />
                Shop/Establishment Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm md:text-base">Business Name</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm md:text-base">Registration Number</Label>
                  <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm md:text-base">Issuing Authority</Label>
                  <Input value={registrationAuthority} onChange={(e) => setRegistrationAuthority(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-sm md:text-base">Registration Document URL</Label>
                <Input value={registrationDocumentUrl} onChange={(e) => setRegistrationDocumentUrl(e.target.value)} placeholder="https://... or data:image/..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <IdCard className="h-4 w-4 md:h-5 md:w-5" />
                Identity Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm md:text-base">ID Type</Label>
                  <Input value={identityProofType} onChange={(e) => setIdentityProofType(e.target.value)} placeholder="e.g., Aadhaar, DL, Passport" />
                </div>
                <div>
                  <Label className="text-sm md:text-base">ID Document URL</Label>
                  <Input value={identityProofUrl} onChange={(e) => setIdentityProofUrl(e.target.value)} placeholder="https://... or data:image/..." />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal-info" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm md:text-base">Your Name</Label>
                  <Input value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-sm md:text-base">Email</Label>
                  <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm md:text-base">Contact Number</Label>
                  <Input value={personal.contactNo} onChange={(e) => setPersonal({ ...personal, contactNo: e.target.value })} />
                </div>
                <div>
                  <Label className="text-sm md:text-base">Address</Label>
                  <Textarea value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} className="min-h-[80px]" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => onSavePersonalInfo(personal)}>Save Personal Info</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PhotoManager value={photos} onChange={setPhotos} />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={async () => {
                    if (!user) return;
                    try {
                      const updated = await authApi.updateImages(photos.slice(0, 10));
                      setUser((prev) => (prev ? { ...prev, images: updated.images } : prev));
                      toast({ title: "Success", description: "Photos updated" });
                    } catch (e) {
                      console.error(e);
                      toast({ title: "Error", description: "Failed to update photos", variant: "destructive" });
                    }
                  }}
                >
                  Save Photos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroomerSettings;
