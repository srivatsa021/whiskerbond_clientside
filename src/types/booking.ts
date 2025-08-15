export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  medications: Medication[];
  instructions?: string;
}

export interface Document {
  type: "prescription" | "receipt" | "report" | "image";
  url: string;
  uploadedAt: Date;
}

export interface Service {
  _id: string;
  serviceName: string;
  category: string;
  price: number;
  duration: string;
  description?: string;
  appointmentRequired: boolean;
  isEmergency: boolean;
}

export interface VetAppointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  petParent: string;
  serviceId: string;
  serviceName: string;
  appointmentTime: Date;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  symptoms?: string;
  isEmergency: boolean;
  price: number;
  duration: string;
  userId: string;
  completedAt?: Date;
  diagnosis?: string;
  treatment?: string;
  prescription?: Prescription;
  followUpRequired: boolean;
  followUpDate?: Date;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
  serviceDetails?: Service;
}

export interface AppointmentFormData {
  diagnosis?: string;
  treatment?: string;
  prescription?: {
    medications?: Medication[];
    instructions?: string;
  };
  followUpRequired?: boolean;
  followUpDate?: string;
}

// Legacy interface for backwards compatibility
export interface VetBooking extends VetAppointment {
  _id: string;
  vetId: string;
  petOwnerId: {
    _id: string;
    name: string;
    email: string;
    contactNo: string;
    address?: string;
  };
  petDetails: {
    name: string;
    breed?: string;
    age?: string;
    species: string;
    weight?: string;
    medicalHistory?: string;
  };
  appointmentDetails: {
    date: Date;
    time: string;
    serviceType: string;
    duration: string;
    notes?: string;
  };
  pricing: {
    servicePrice: number;
    additionalCharges: number;
    totalAmount: number;
    paymentStatus: "pending" | "paid" | "refunded";
  };
  completion: {
    completedAt?: Date;
    diagnosis?: string;
    treatment?: string;
    prescription?: Prescription;
    followUpRequired: boolean;
    followUpDate?: Date;
    documents: Document[];
  };
}
