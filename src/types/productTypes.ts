// src/types/productTypes.ts

export interface PriceComment {
  commentId: string;
  name: string;
  description: string;
  productPriceId: string;
  branchId: string;
  companyId: string;
  status: boolean;
  errors?: any[]; // أو تحديد النوع المناسب
}

export interface ProductPrice {
  productPriceId: string;
  lineType: number; // 1: price, 2: commentGroup, 3: groupProduct
  productPriceName?: string;
  price?: number;
  priceComments?: PriceComment[];
  qtyToSelect?: number;
  groupPriceType?: number; // 1: zero, 2: asproduct, 3: manual
  groupPrice?: number;
  priceGroups?: any[]; // تحديد النوع المناسب إذا كان لديك
  branchId: string;
  companyId: string;
  status: boolean;
}

export interface Product {
  productId?: string;
  productName: string;
  productName2?: string;
  productGroupId: string;
  branchId: string;
  posScreenId?: string;
  discount?: number;
  vat?: number;
  companyId: string;
  status: boolean;
  productPrices: ProductPrice[];
}
