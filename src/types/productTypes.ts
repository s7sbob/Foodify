// src/types/productTypes.ts

export interface PriceComment {
  commentId: string;
  name: string;
  description: string;
  productPriceId: string;
  branchId: string;
  companyId: string;
  status: boolean;
  errors: any[];
}

export interface ProductPrice {
  productPriceId: string;
  productPriceName?: string;
  lineType: number;
  price?: number;
  priceComments?: PriceComment[];
  qtyToSelect?: number;
  groupPriceType?: number;
  groupPrice?: number;
  priceGroups?: PriceGroup[];
  branchId: string;
  companyId: string;
  status: boolean;
}

export interface PriceGroup {
  productId: string;
  productPriceId: string;
  quantity: number;
}

export interface Product {
  productId: string;
  productName: string;
  productName2?: string;
  productGroupId: string;
  productPrices: ProductPrice[];
  branchId: string;
  companyId: string;
  posScreenId?: string;
  discount?: number;
  vat?: number;
  status: boolean;
}

export interface SelectedProduct {
  productId: string;
  productPriceId: string;
  quantity: number;
}