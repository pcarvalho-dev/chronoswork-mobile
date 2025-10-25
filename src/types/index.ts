export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  department?: string;
  position?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLog {
  id: string;
  checkIn: string;
  checkOut: string | null;
  checkInPhoto: string;
  checkOutPhoto: string | null;
  checkInLatitude: number;
  checkInLongitude: number;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  user?: User;
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
