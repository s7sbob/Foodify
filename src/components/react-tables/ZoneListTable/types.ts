// types.ts

export interface ZoneData {
  zoneId: string;
  name: string;
  deliveryFee: number;
  deliveryBonus: number;
  branchId: string;
  companyId: string;
  errors: any[];
}

export interface Company {
  companyId: string;
  companyName: string;
  country: string;
  branches: Branch[];
  currency: string;
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
  // Add other relevant fields as necessary
}
