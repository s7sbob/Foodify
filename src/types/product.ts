// src/types/product.ts

export interface PriceComment {
  commentId: string;
  name: string;
  description: string | null;
  productPriceId: string;
  branchId: string;
  companyId: string;
  isDeleted: boolean;
  status: boolean;
  errors: any[];
}

export interface ProductPriceGroup {
  productPriceGroupId: string;
  productPriceId: string;
  branchId: string;
  companyId: string;
  isDeleted: boolean;
  status: boolean;
  errors: any[];
}

export interface ProductPrice {
  productPriceId: string;
  productPriceName: string | null;
  lineType: number;
  price: number | null;
  priceComments?: PriceComment[];
  qtyToSelect: number;
  priceGroups?: ProductPrice[]; 
  groupPriceType: number;
  groupPrice: number;
  branchId: string;
  companyId: string;
  isDeleted: boolean;
  status: boolean;
  errors: any[];
}

export interface Product {
  productId: string;
  productName: string;
  productName2: string;
  productPrices: ProductPrice[];
  productGroupId: string;
  posScreenId: string;
  productImage: string;
  imageFile: string | null;
  discount: number;
  vat: number;
  branchId: string;
  companyId: string;
  isDeleted: boolean;
  status: boolean;
  errors: any[];
}
