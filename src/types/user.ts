export type BusinessType = "vet" | "trainer" | "boarding" | "walker" | "ngo";

export interface User {
  id: string;
  email: string;
  name: string;
  businessType: BusinessType;
  businessName: string;
  address: string;
  contactNo?: string;
  images?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
  businessType: BusinessType;
  businessName: string;
  address: string;
  contactNo?: string;
  images?: string[];
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (credentials: LoginCredentials) => Promise<true | string>;
  signup: (credentials: SignupCredentials) => Promise<true | string>;
  logout: () => void;
  isLoading: boolean;
}
