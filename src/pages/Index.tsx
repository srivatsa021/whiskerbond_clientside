import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Stethoscope, Award, Home, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const businessTypes = [
    {
      icon: Stethoscope,
      title: "Veterinary Hospitals",
      description:
        "Manage appointments, patient records, and medical consultations",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Award,
      title: "Pet Trainers",
      description:
        "Track training sessions, progress, and behavioral development",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Home,
      title: "Pet Boarding",
      description: "Monitor pet care, feeding schedules, and daily activities",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Users,
      title: "Pet Walkers",
      description: "Manage walking schedules, routes, and pet behavior notes",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Heart,
      title: "NGOs & Shelters",
      description: "Handle adoptions, donations, and animal welfare programs",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">WhiskerBond</h1>
            </div>
            <Button onClick={() => navigate("/login")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Pet Care
            <span className="text-blue-600"> Management Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your pet care business with our comprehensive management
            system. From veterinary clinics to pet walkers, we've got you
            covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="px-8 py-3"
            >
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Every Pet Care Professional
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform adapts to your specific needs, whether you're running
              a veterinary clinic, training pets, or managing a shelter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessTypes.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${service.bgColor} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <service.icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need to Manage Your Pet Care Business
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Appointment Management
                    </h3>
                    <p className="text-gray-600">
                      Schedule and track all your appointments in one place
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Digital Records
                    </h3>
                    <p className="text-gray-600">
                      Maintain comprehensive digital records for all pets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Real-time Updates
                    </h3>
                    <p className="text-gray-600">
                      Keep pet owners informed with instant notifications
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Emergency Support
                    </h3>
                    <p className="text-gray-600">
                      Built-in SOS system for emergency situations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="mb-6">
                Join thousands of pet care professionals who trust our platform
                to manage their businesses efficiently.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/login")}
              >
                Create Your Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-bold">WhiskerBond</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Professional pet care management made simple
            </p>
            <p className="text-sm text-gray-500">
              © 2025 WhiskerBond. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
