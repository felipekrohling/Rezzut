export interface Proposal {
  id: string;
  supplierName: string;
  price: number;
  currency: string;
  deliveryDays: number;
  deliveryDate?: string; // Specific estimated delivery date
  paymentTerms: string; // e.g., "30 days", "50% advance", "Net 60"
  technicalSpecs: string; // Supplier's version of specs
  validityDate: string;
}

export enum RequestStatus {
  REQUESTED = 'Solicitado',
  QUOTED = 'Cotada',
  CANCELLED = 'Cancelada',
  COMPLETED = 'Finalizada'
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
}

export interface RequestHistory {
  date: string;
  action: string; // 'Criado', 'Aprovado para Cotação', 'Finalizado', 'Cancelado', 'Editado'
  userId: string;
  userName: string;
  userRole: string;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  requiredQuantity: number;
  unit: string; // e.g., 'Unidade', 'Metro', 'Kg'
  purpose: 'Consumo' | 'Revenda';
  targetSpecs: string; // What the company wants
  costCenterId?: string; // Link to CostCenter
  status: RequestStatus;
  proposals: Proposal[];
  selectedProposalId?: string; // Manually selected winner
  aiAnalysis?: AIAnalysisResult;
  history: RequestHistory[];
}

export interface AIAnalysisResult {
  recommendedSupplierId: string;
  reasoning: string;
  scores: {
    supplierId: string;
    commercialScore: number; // 0-10
    technicalScore: number; // 0-10
    deliveryScore: number; // 0-10
    totalScore: number; // 0-10
    pros: string[];
    cons: string[];
  }[];
}

export enum UserRole {
  ADMIN = 'Administrador',
  BUYER = 'Comprador',
  REQUESTER = 'Solicitante'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactEmail: string;
}

// Permission System Types
export type PermissionKey = 
  | 'dashboard_view'
  | 'request_view'
  | 'request_create'
  | 'request_edit' // Includes Cancel
  | 'request_approve' // Move to Quotation
  | 'quotation_view'
  | 'quotation_edit_proposals' // Add/Edit proposals, Equalize
  | 'quotation_finalize' // Approve Purchase
  | 'completed_view'
  | 'completed_export'
  | 'settings_view'
  | 'settings_edit'; // Manage Users, Suppliers, Cost Centers, Permissions

export interface RolePermissions {
  role: UserRole;
  permissions: PermissionKey[];
}