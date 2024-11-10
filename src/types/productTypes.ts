// src/types/productTypes.ts

export interface Product {
    productId: string;
    productName: string;
    productName2: string;
    productPrices: ProductPrice[];
    productGroupId: string;
    posScreenId: string | null;
    productImage: string;
    imageFile: string | null;
    discount: number;
    vat: number;
    branchId: string;
    companyId: string;
    status: boolean;
    errors: any[];
  }
  
  export interface ProductPrice {
    productPriceId: string;
    productPriceName: string;
    lineType: number;
    price: number;
    priceComments: PriceComment[];
    qtyToSelect: number;
    priceGroups: PriceGroup[];
    groupPriceType: number;
    groupPrice: number;
    branchId: string;
    companyId: string;
    status: boolean;
    errors: any[];
  }
  
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
  
  export interface PriceGroup {
    productPriceGroupId: string;
    productPriceId: string;
    branchId: string;
    companyId: string;
    status: boolean;
    errors: any[];
  }
  