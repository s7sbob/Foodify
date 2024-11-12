// src/types/productTypes.ts

export interface PriceComment {
  commentId?: string;
  name: string;
  description?: string | null;
  productPriceId: string;
  branchId: string;
  companyId: string;
  status: boolean;
  errors?: any[];
}

export interface GroupProduct {
  productPriceGroupId: string;
  productPriceId: string;
  branchId: string;
  companyId: string;
  status: boolean;
  errors?: any[];
}

export interface ProductPrice {
  productPriceId: string;
  productPriceName?: string; // متاح فقط لـ lineType 1 و 3
  lineType: number; // 1: price, 2: commentGroup, 3: groupProduct
  price?: number; // متاح فقط لـ lineType 1
  comment?: string; // متاح فقط لـ lineType 2
  description?: string | null; // متاح فقط لـ lineType 2
  priceComments?: PriceComment[]; // متاح فقط لـ lineType 2
  qtyToSelect?: number; // متاح فقط لـ lineType 3
  priceGroups?: GroupProduct[]; // متاح فقط لـ lineType 3
  groupPriceType?: number; // متاح فقط لـ lineType 3
  groupPrice?: number; // متاح فقط لـ lineType 3
  branchId: string;
  companyId: string;
  status: boolean;
  errors?: any[];
}

export interface Product {
  productId: string;
  productName: string;
  productName2?: string;
  discount?: number;
  vat?: number;
  productGroupId: string;
  productPrices: ProductPrice[];
  branchId: string;
  companyId: string;
  posScreenId?: string | null;
  productImage?: string;
  imageFile?: File | null;
  status: boolean;
  errors?: any[];
}
