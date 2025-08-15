// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If we're in development mode with localhost
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:5000/api";
  }

  // For deployed environments, check if backend is available on same host
  // If not, we'll gracefully fall back to localStorage
  const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
  return `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

console.log("API Base URL configured as:", API_BASE_URL);

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const getAuthToken = () => {
  return localStorage.getItem("token");
};

const makeRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`Making API request to: ${url}`); // Debug log
    const response = await fetch(url, config);

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If we can't parse JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error); // Debug log

    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError("Database down. Please try again later.", 503);
    }

    // Other errors
    throw new ApiError("Request failed", 0);
  }
};

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData: {
    name: string;
    email: string;
    password: string;
    businessType: string;
    businessName: string;
    address: string;
    contactNo?: string;
  }) =>
    makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => makeRequest("/auth/me"),

  updateProfile: (profileData: {
    name?: string;
    email?: string;
    contactNo?: string;
    businessName?: string;
    address?: string;
  }) =>
    makeRequest("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// Vet Services API
export const vetServicesApi = {
  getServices: () => makeRequest(`/vet-services`),
  createService: (serviceData: any) =>
    makeRequest("/vet-services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    }),
  updateService: (id: string, serviceData: any) =>
    makeRequest(`/vet-services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    }),
  deleteService: (id: string) =>
    makeRequest(`/vet-services/${id}`, { method: "DELETE" }),
};

// Vet Profile API
export const vetProfileApi = {
  getProfile: () => makeRequest(`/vet-profile`),
  updateProfile: (profileData: { emergency24Hrs: boolean }) =>
    makeRequest(`/vet-profile`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// Vet Bookings API
export const vetBookingsApi = {
  // Get all bookings for the vet
  getBookings: (params?: { status?: string; date?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.date) queryParams.append("date", params.date);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return makeRequest(`/vet-bookings${query ? `?${query}` : ""}`);
  },

  // Get today's appointments
  getTodaysBookings: () => makeRequest("/vet-bookings/today"),

  // Get upcoming appointments (next 7 days)
  getUpcomingBookings: () => makeRequest("/vet-bookings/upcoming"),

  // Get specific booking details
  getBooking: (bookingId: string) => makeRequest(`/vet-bookings/${bookingId}`),

  // Update appointment status
  updateStatus: (bookingId: string, status: string) =>
    makeRequest(`/vet-bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Complete appointment with diagnosis and prescription
  completeAppointment: (bookingId: string, completionData: {
    diagnosis?: string;
    treatment?: string;
    prescription?: {
      medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
      }>;
      instructions?: string;
    };
    followUpRequired?: boolean;
    followUpDate?: string;
  }) =>
    makeRequest(`/vet-bookings/${bookingId}/complete`, {
      method: "PATCH",
      body: JSON.stringify(completionData),
    }),

  // Upload document (prescription, receipt, etc.)
  uploadDocument: (bookingId: string, documentData: {
    type: "prescription" | "receipt" | "report" | "image";
    url: string;
  }) =>
    makeRequest(`/vet-bookings/${bookingId}/documents`, {
      method: "POST",
      body: JSON.stringify(documentData),
    }),
};

// Trainer Plans API
export const trainerPlansApi = {
  getPlans: () => makeRequest(`/trainer-plans`),
  createPlan: (planData: any) =>
    makeRequest("/trainer-plans", {
      method: "POST",
      body: JSON.stringify(planData),
    }),
  updatePlan: (id: string, planData: any) =>
    makeRequest(`/trainer-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(planData),
    }),
  deletePlan: (id: string) =>
    makeRequest(`/trainer-plans/${id}`, { method: "DELETE" }),
};

// NGO Pets API
export const ngoPetsApi = {
  getPets: () => makeRequest(`/ngo-pets`),
  createPet: (petData: any) =>
    makeRequest("/ngo-pets", { method: "POST", body: JSON.stringify(petData) }),
  updatePet: (id: string, petData: any) =>
    makeRequest(`/ngo-pets/${id}`, {
      method: "PUT",
      body: JSON.stringify(petData),
    }),
  deletePet: (id: string) =>
    makeRequest(`/ngo-pets/${id}`, { method: "DELETE" }),
};

// Removed Boarding Profile API as it's no longer needed and its functionality
// is handled by authApi for personal info updates.
// export const boardingProfileApi = {
//   getProfile: () =>
//     makeRequest("/boarding-profile", {
//       method: "GET",
//     }),
//   updateProfile: (updatedFields: any) =>
//     makeRequest("/boarding-profile", {
//       method: "PUT",
//       body: JSON.stringify(updatedFields),
//     }),
// };

// Services API (for other business types)
export const servicesApi = {
  getServices: (params?: { category?: string; isActive?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const query = queryParams.toString();
    return makeRequest(`/services${query ? `?${query}` : ""}`);
  },

  getService: (id: string) => makeRequest(`/services/${id}`),

  createService: (serviceData: any) =>
    makeRequest("/services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    }),

  updateService: (id: string, serviceData: any) =>
    makeRequest(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    }),

  deleteService: (id: string) =>
    makeRequest(`/services/${id}`, {
      method: "DELETE",
    }),

  toggleService: (id: string) =>
    makeRequest(`/services/${id}/toggle`, {
      method: "PATCH",
    }),
};

// Tasks API
export const tasksApi = {
  getTasks: (params?: {
    status?: string;
    category?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.priority) queryParams.append("priority", params.priority);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const query = queryParams.toString();
    return makeRequest(`/tasks${query ? `?${query}` : ""}`);
  },

  getTask: (id: string) => makeRequest(`/tasks/${id}`),

  createTask: (taskData: any) =>
    makeRequest("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),

  updateTask: (id: string, taskData: any) =>
    makeRequest(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    }),

  deleteTask: (id: string) =>
    makeRequest(`/tasks/${id}`, {
      method: "DELETE",
    }),

  updateTaskStatus: (id: string, status: string) =>
    makeRequest(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addTaskNote: (id: string, content: string) =>
    makeRequest(`/tasks/${id}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getTaskStats: () => makeRequest("/tasks/stats/overview"),
};

export { ApiError };
