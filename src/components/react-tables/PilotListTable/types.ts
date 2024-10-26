// src/components/Pilots/types.ts

export interface PilotTableData {
  pilotId: string;
  name: string;
  phone: string;
  isActive: boolean;
  branchName: string;
  companyName: string;
  branchId: string;
  companyId: string;
}

export interface Company {
  companyId: string;
  companyName: string;
  branches: Branch[];
}

export interface Branch {
  branchId: string;
  branchName: string;
}

export interface TableMeta {
  handleEdit: (pilot: PilotTableData) => void;
}
