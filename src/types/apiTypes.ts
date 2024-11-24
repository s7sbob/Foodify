// src/types/apiTypes.ts

export interface PosScreen {
    screenId: string;
    screenName: string;
    parentScreenId: string | null;
    textColor: string | null;
    color: string;
    img: string;
    order: number;
    imageFile: string | null;
    isDeleted: boolean;
    status: boolean;
    errors: any[]; // يمكنك تخصيص نوع الأخطاء بناءً على هيكلها الفعلي
  }
  
  export interface ProductPriceComment {
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
  
  export interface ProductPrice {
    productPriceId: string;
    productPriceName: string | null;
    lineType: number;
    price: number | null;
    priceComments: ProductPriceComment[];
    qtyToSelect: number;
    priceGroups: any[]; // يمكنك تخصيص هذا النوع بناءً على البيانات الفعلية
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
  