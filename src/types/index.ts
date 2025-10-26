export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
  workSchedule?: string;
  employmentType?: string;
  directSupervisor?: string;
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  bankAccountType?: string;
  pix?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  education?: string;
  notes?: string;
  photo?: string;
  isActive?: boolean;
  isApproved?: boolean;
  role?: 'manager' | 'employee';
  companyId?: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  checkIn: string;
  checkOut: string | null;
  checkInPhoto: string;
  checkOutPhoto: string | null;
  latitude: number;
  longitude: number;
  outLatitude: number | null;
  outLongitude: number | null;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  corporateName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: number;
  code: string;
  email: string;
  name?: string;
  position?: string;
  department?: string;
  isUsed: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  department?: string;
  position?: string;
}

export interface ManagerRegisterData {
  name: string;
  email: string;
  password: string;
  company: {
    name: string;
    cnpj: string;
    corporateName?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    addressNumber?: string;
    addressComplement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    description?: string;
  };
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  bankAccountType?: string;
  pix?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  education?: string;
  notes?: string;
}

export interface EmployeeRegisterData {
  invitationCode: string;
  name: string;
  email: string;
  password: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
  workSchedule?: string;
  employmentType?: string;
  directSupervisor?: string;
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  bankAccountType?: string;
  pix?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  education?: string;
  notes?: string;
}

export interface UpdateCompanyData {
  name?: string;
  cnpj?: string;
  corporateName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  description?: string;
}

export interface CreateInvitationData {
  email: string;
  name?: string;
  position?: string;
  department?: string;
  expiresAt?: string;
}

export interface InvitationsResponse {
  invitations: Invitation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ManagerRegisterResponse {
  message: string;
  user: User;
  company: Company;
  accessToken: string;
  refreshToken: string;
}

export interface EmployeeRegisterResponse {
  message: string;
  user: User;
  requiresApproval: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  user: User;
}
