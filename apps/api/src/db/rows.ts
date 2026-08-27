import type { CoverageOptions } from './schema';

export interface HealthEventRow {
  id: number;
  checkedAt: Date;
  ok: boolean;
  note: string | null;
}

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  termsAccepted: boolean;
  marketingOptIn: boolean;
  createdAt: Date;
}

export interface ApplicationRow {
  id: string;
  userId: string;
  stage: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleRow {
  id: string;
  applicationId: string;
  licensePlate: string;
  manufacturer: string;
  model: string;
  year: number;
  color: string;
}

export interface CoverageSelectionRow {
  id: string;
  applicationId: string;
  coverageType: string;
  options: CoverageOptions;
}
