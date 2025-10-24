import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Settings, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trainerServicesApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface TrainerService {
  _id: string;
  serviceName: string;
  description?: string;
  tier: "tier1" | "tier2" | "tier3" | "custom";
  basePrice: number;
  price: number;
  duration?: string;
  frequency?: "daily" | "alternate" | "days_per_week";
  daysPerWeek?: number;
  serviceTypes: ("shop" | "house")[];
}

const TIER_CONFIG = {
  tier1: {
    label: "Tier 1",
    basePrice: 100,
    plan: "1 week · Daily · 7 sessions",
    points: ["Basic obedience", "Leash training", "Sit/Stay", "Recall intro", "House manners"],
  },
  tier2: {
    label: "Tier 2",
    basePrice: 200,
    plan: "2 weeks · Alternate days · 7 sessions",
    points: ["Advanced commands", "Impulse control", "Loose-leash", "Socialization", "Crate training"],
  },
  tier3: {
    label: "Tier 3",
    basePrice: 300,
    plan: "3 weeks · 5 days/week · 15 sessions",
    points: ["Behavior correction", "Aggression mgmt", "Anxiety protocols", "Off-leash", "Custom plans"],
  },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

type ServiceForm = {
  name: string;
  description?: string;
  tier: TrainerService["tier"];
  basePrice: number;
  price: number;
  duration?: string;
  frequency?: "daily" | "alternate" | "days_per_week";
  daysPerWeek?: number;
  serviceTypes: ("shop" | "house")[];
};

const Services = () => {
  const [services, setServices] = useState<TrainerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceForm>({
    name: "",
    description: "",
    tier: "custom",
    basePrice: 0,
    price: 0,
    duration: "",
    serviceTypes: [],
  });

  const selectedTiers = useMemo(() => {
    const map: Partial<Record<TierKey, TrainerService>> = {};
    services.forEach((s) => {
      if (s.tier !== "custom") {
        map[s.tier as TierKey] = s;
      }
    });
    return map;
  }, [services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await trainerServicesApi.getServices();
      setServices(data);
    } catch (e) {
      toast({ title: "Error", description: "Could not fetch services", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getTierDescription = (tier: TierKey) => TIER_CONFIG[tier].points.join(" • ");

  const openTierDialog = (tier: TierKey) => {
    const existing = selectedTiers[tier];
    if (existing) {
      setEditingId(existing._id);
      setForm({
        name: existing.serviceName,
        description: (existing.description && existing.description.trim().length > 0) ? existing.description : getTierDescription(tier),
        tier: existing.tier,
        basePrice: existing.basePrice,
        price: existing.price,
        duration: existing.duration || (tier === "tier1" ? "1 week" : tier === "tier2" ? "2 weeks" : "3 weeks"),
        frequency: existing.frequency || (tier === "tier1" ? "daily" : tier === "tier2" ? "alternate" : "days_per_week"),
        daysPerWeek: existing.daysPerWeek || (tier === "tier3" ? 5 : undefined),
        serviceTypes: existing.serviceTypes || [],
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        description: getTierDescription(tier),
        tier,
        basePrice: TIER_CONFIG[tier].basePrice,
        price: TIER_CONFIG[tier].basePrice,
        duration: tier === "tier1" ? "1 week" : tier === "tier2" ? "2 weeks" : "3 weeks",
        frequency: tier === "tier1" ? "daily" : tier === "tier2" ? "alternate" : "days_per_week",
        daysPerWeek: tier === "tier3" ? 5 : undefined,
        serviceTypes: [],
      });
    }
    setDialogOpen(true);
  };

  const openCustomDialog = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      tier: "custom",
      basePrice: 0,
      price: 0,
      duration: "",
      frequency: undefined,
      daysPerWeek: undefined,
      serviceTypes: [],
    });
    setDialogOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.name.trim()) {
        toast({ title: "Missing name", description: "Please enter a Service Name", variant: "destructive" });
        return;
      }
      if (form.price < form.basePrice) {
        toast({ title: "Invalid price", description: "Price must be at least the base price", variant: "destructive" });
        return;
      }

      if (form.tier === "custom") {
        if (!form.duration || !form.duration.trim()) {
          toast({ title: "Missing duration", description: "Please enter duration (e.g., 2 weeks)", variant: "destructive" });
          return;
        }
        if (!form.frequency) {
          toast({ title: "Missing frequency", description: "Please select a frequency", variant: "destructive" });
          return;
        }
        if (form.frequency === "days_per_week" && (!form.daysPerWeek || form.daysPerWeek < 1 || form.daysPerWeek > 6)) {
          toast({ title: "Invalid days/week", description: "Days per week must be 1–6", variant: "destructive" });
          return;
        }
      }

      const payload = {
        name: form.name,
        description: form.tier !== "custom" ? ((form.description && form.description.trim().length > 0) ? form.description : TIER_CONFIG[form.tier as TierKey].points.join(" • ")) : (form.description || ""),
        tier: form.tier,
        basePrice: form.basePrice,
        price: form.price,
        duration: form.duration,
        frequency: form.frequency,
        daysPerWeek: form.daysPerWeek,
        serviceTypes: form.serviceTypes,
      };

      if (editingId) {
        await trainerServicesApi.updateService(editingId, payload);
        toast({ title: "Updated", description: "Service updated" });
      } else {
        await trainerServicesApi.createService(payload);
        toast({ title: "Added", description: "Service added" });
      }
      setDialogOpen(false);
      fetchServices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save service", variant: "destructive" });
    }
  };

  const deleteService = async (id: string) => {
    try {
      await trainerServicesApi.deleteService(id);
      toast({ title: "Deleted", description: "Service removed" });
      fetchServices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const TierCard: React.FC<{ tier: TierKey }> = ({ tier }) => {
    const cfg = TIER_CONFIG[tier];
    const active = !!selectedTiers[tier];
    const svc = selectedTiers[tier];
    return (
      <Card className={active ? "border-green-500 bg-green-50" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {cfg.label}
              {active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">Active</span>}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-gray-700">{cfg.plan}</div>
          <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
            {cfg.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
          <div className="text-sm font-semibold">Base price: ₹{cfg.basePrice}</div>
          {active && (
            <div className="text-sm">Your price: <span className="font-bold">₹{svc?.price}</span></div>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => openTierDialog(tier)}>
              {active ? "Edit" : "Select"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CustomCard = () => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Custom Service</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Button size="sm" className="w-full" onClick={openCustomDialog}>
          <Plus className="h-4 w-4 mr-1" /> Add Custom Service
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-bold">Services</h2>
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <Settings className="h-4 w-4" /> Configure your offerings
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {(["tier1","tier2","tier3"] as TierKey[]).map((t) => (
          <TierCard key={t} tier={t} />
        ))}
        <CustomCard />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">{form.tier === "custom" ? (editingId ? "Edit Custom Service" : "Add Custom Service") : (editingId ? "Edit Tier Service" : "Add Tier Service")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitForm} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm">Service Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Basic Obedience" />
            </div>
            {form.tier !== "custom" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Tier</Label>
                  <Input value={TIER_CONFIG[form.tier as TierKey].label} readOnly />
                </div>
                <div>
                  <Label className="text-sm">Base Price (₹)</Label>
                  <Input type="number" value={form.basePrice} readOnly />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Plan</Label>
                  <Input value={(TIER_CONFIG as any)[form.tier as TierKey].plan} readOnly />
                </div>
              </div>
            )}
            {form.tier === "custom" && (
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <Label className="text-sm">Base Price (₹)</Label>
                  <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm">Duration</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 2 weeks or 10 days" />
                </div>
                <div>
                  <Label className="text-sm">Frequency</Label>
                  <select
                    className="w-full border rounded h-9 px-2 text-sm bg-white"
                    value={form.frequency || ""}
                    onChange={(e) => setForm({ ...form, frequency: (e.target.value || undefined) as any })}
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="alternate">Alternate days</option>
                    <option value="days_per_week">Days per week</option>
                  </select>
                </div>
                {form.frequency === "days_per_week" && (
                  <div>
                    <Label className="text-sm">Days per week (1–6)</Label>
                    <Input type="number" value={form.daysPerWeek || 3} onChange={(e) => setForm({ ...form, daysPerWeek: parseInt(e.target.value || "0", 10) })} />
                  </div>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="price" className="text-sm">Your Price (₹) {form.basePrice > 0 && <span className="text-gray-500">(≥ {form.basePrice})</span>}</Label>
              <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
            </div>
            {form.tier === "custom" && (
              <div>
                <Label htmlFor="desc" className="text-sm">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
            )}
            <div>
              <Label className="text-sm">Service Type</Label>
              <div className="flex gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.serviceTypes.includes("shop")}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) => ({
                        ...prev,
                        serviceTypes: checked
                          ? Array.from(new Set([...(prev.serviceTypes || []), "shop"]))
                          : (prev.serviceTypes || []).filter((t) => t !== "shop"),
                      }));
                    }}
                  />
                  At Trainer’s Shop
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.serviceTypes.includes("house")}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setForm((prev) => ({
                        ...prev,
                        serviceTypes: checked
                          ? Array.from(new Set([...(prev.serviceTypes || []), "house"]))
                          : (prev.serviceTypes || []).filter((t) => t !== "house"),
                      }));
                    }}
                  />
                  At Pet Owner’s House
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} size="sm">Cancel</Button>
              <Button type="submit" size="sm">{editingId ? "Update" : "Add"} Service</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        <h3 className="text-base font-semibold">Your Services</h3>
        {loading ? (
          <Card><CardContent className="p-6 text-center text-sm">Loading...</CardContent></Card>
        ) : services.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-sm">No services yet. Add one above.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {services.map((svc) => (
              <Card key={svc._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base truncate">{svc.serviceName}</CardTitle>
                    {svc.tier !== "custom" && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100">{TIER_CONFIG[svc.tier as TierKey].label}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-gray-700">
                    {svc.tier !== "custom"
                      ? TIER_CONFIG[svc.tier as TierKey].plan
                      : `${svc.duration || ""}${svc.frequency ? " · " + (svc.frequency === "daily" ? "Daily" : svc.frequency === "alternate" ? "Alternate days" : `${svc.daysPerWeek || 3} days/week`) : ""}`}
                  </div>
                  {svc.description && <p className="text-xs text-gray-600 line-clamp-3">{svc.description}</p>}
                  <div className="text-sm">Types: {svc.serviceTypes?.length ? svc.serviceTypes.join(", ") : "—"}</div>
                  <div className="text-lg font-bold text-green-600">₹{svc.price}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingId(svc._id);
                      setForm({
                        name: svc.serviceName,
                        description: svc.tier !== "custom" ? (svc.description && svc.description.trim().length > 0 ? svc.description : getTierDescription(svc.tier as TierKey)) : (svc.description || ""),
                        tier: svc.tier,
                        basePrice: svc.basePrice,
                        price: svc.price,
                        duration: svc.duration || "",
                        frequency: svc.frequency,
                        daysPerWeek: svc.daysPerWeek,
                        serviceTypes: svc.serviceTypes || [],
                      });
                      setDialogOpen(true);
                    }}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteService(svc._id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
