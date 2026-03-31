// types/patient.ts
export interface Contact {
  address: string | null;
  number: string | null;
  email: string | null;
}

export interface Patient {
  patient_id: number;
  patient_name: string;
  age: number;
  photo_url: string | null;
  contact: Contact[];
  medical_issue: string;
}

export interface PatientsApiResponse {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}