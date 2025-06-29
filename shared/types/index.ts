// User Management Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'engineer' | 'supervisor' | 'operator';
  department: string;
  createdAt: string;
  updatedAt: string;
}

// Machine Types
export interface Machine {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  department: string;
  installDate: string;
  lastMaintenance: string;
  image?: string;
  manuals: Manual[];
}

// Manual/Document Types
export interface Manual {
  id: string;
  title: string;
  type: 'PDF' | 'DOC' | 'TXT';
  pages: number;
  lastUpdated: string;
  sections: string[];
  filePath: string;
  machineId: string;
}

// Session Types
export interface TroubleshootingSession {
  id: string;
  machineId: string;
  userId: string;
  problem: string;
  messages: ChatMessage[];
  resolved: boolean;
  solution?: string;
  startTime: string;
  endTime?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  confidence?: 'high' | 'medium' | 'low';
  timestamp: string;
  sources?: DocumentReference[];
}

export interface DocumentReference {
  manualId: string;
  manualTitle: string;
  pageNumber?: number;
  section?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'engineer' | 'supervisor' | 'operator';
  department: string;
}

// AI Confidence Levels
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Document Upload Types
export interface DocumentUpload {
  file: File;
  machineId: string;
  title: string;
  type: 'manual' | 'schematic' | 'parts-list' | 'maintenance-guide';
}