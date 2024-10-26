// src/types/Waiter.ts

export interface Waiter {
  waiterId: string;
  waiterName: string;
  branchId: string;
  companyId: string;
  companyName: string;
  branchName: string;
}

export interface EnhancedWaiter extends Waiter {
  companyName: string;
  branchName: string;
}
