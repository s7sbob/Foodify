// src/components/Zones/types.ts

export interface TableSection {
    tableSectionId: string;
    sectionName: string;
    service: number;
    branchId: string;
    companyId: string;
    status: boolean;
    errors: any[];
  }
  
  export interface Table {
    tableId: string;
    tableName: string;
    tableSectionId: string;
    branchId: string;
    companyId: string;
    status: boolean;
    errors: any[];
  }
  
  
  export interface Company {
    companyId: string;
    companyName: string;
    country: string;
    branches: Branch[];
    // Add other relevant fields as necessary
  }
  
  export interface Branch {
    branchId: string;
    branchCode: number;
    branchName: string;
    address: string;
    country: string;
    currency: string;
    email: string;
    governate: string;
    phoneNo1: string;
    phoneNo2: string | null;
    phoneNo3?: string | null;
    status: boolean;
    // Remove 'tableSections' as it's managed separately
    // Add other relevant fields as necessary
  }
  