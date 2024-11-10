// src/types/productTypes.ts

export interface PriceComment {
  commentId?: string;
  name: string;
  link: string;
  branchId: string;
  companyId: string;
  status: boolean;
  errors?: any[];
}

export interface PriceGroup {
  productPriceGroupId?: string;
  productPriceId?: string;
  branchId: string;
  companyId: string;
  status: boolean;
  errors?: any[];
}

export interface ProductPrice {
  productPriceId?: string;
  productPriceName: string;
  lineType: number;
  price: number;
  groupPriceType?: number;
  groupPrice: number;
  qtyToSelect: number;
  priceComments: PriceComment[];
  branchId: string;
  companyId: string;
  priceGroups: PriceGroup[];
  status: boolean;
  errors?: any[];
}

export interface Product {
  productId?: string;
  productName: string;
  productName2?: string;
  discount?: number;
  vat?: number;
  productGroupId: string;
  productPrices: ProductPrice[];
  branchId: string;
  companyId: string;
  posScreenId?: string;
  status: boolean;
  errors?: any[];
}
