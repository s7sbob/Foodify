// companyTypes.ts

export interface Branch {
  branchId: string;
  branchCode: number;
  branchName: string;
  country: string;
  governate: string;
  address: string;
  phoneNo1: string;
  phoneNo2: string | null;
  email: string;
  currency: string;
}

export interface CompanyData {
  companyId: string;
  companyName: string;
  country: string;
  governate: string;
  address: string;
  activity: string;
  phoneNo1: string;
  phoneNo2: string | null;
  phoneNo3: string | null;
  currency: string;
  email: string;
  branches: Branch[];
  status: boolean;
  errors: any[];
}

