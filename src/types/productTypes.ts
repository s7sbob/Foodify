// src/types/productTypes.ts

export interface PriceComment {
  commentId?: string; // جعله اختياريًا
  name: string;
  productPriceId: string;
  branchId: string;
  companyId: string;
  status: boolean;
  isDeleted?: boolean; // إضافة حقل isDeleted
  errors: any[];
}

export interface SelectedProduct {
  productId: string;
  productPriceId: string;
  productName: string;
  priceName: string;
  price: number;
  productPriceGroupId?: string; // إضافة حقل productPriceGroupId
  branchId: string; // إضافة حقل branchId
  companyId: string; // إضافة حقل companyId
  isDeleted: boolean; // إضافة حقل isDeleted
  status: boolean;     // إضافة حقل status
  quantity: number;    // إضافة حقل quantity
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
  priceGroups?: SelectedProduct[]; // تم تحديث واجهة SelectedProduct
  branchId: string;
  companyId: string;
  status: boolean;
  productId: string;
  productName: string;
  priceName: string;
  isDeleted?: boolean; // إضافة حقل isDeleted
  errors: any[];
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
  isDeleted?: boolean; // إضافة حقل isDeleted
}
