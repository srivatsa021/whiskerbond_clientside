import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { VetHospitalPage } from "./Veterinary Hospital";
import PetTrainerDashboard from "./Pet Trainer";
import BoardingDashboard from "./dashboard/BoardingDashboard";
import WalkerDashboard from "./dashboard/WalkerDashboard";
import NGODashboard from "./dashboard/NGODashboard";

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  console.log("🧪 Dashboard user:", user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  switch (user.businessType) {
    case "vet":
      return <VetHospitalPage />;
    case "trainer":
      return <PetTrainerDashboard />;
    case "boarding":
      return <BoardingDashboard />;
    case "walker":
      return <WalkerDashboard />;
    case "ngo":
      return <NGODashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Business Type
            </h1>
            <p className="text-gray-600">
              Please contact support for assistance.
            </p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
