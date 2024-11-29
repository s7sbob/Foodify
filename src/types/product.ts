// src/types/product.ts

export interface Product {
    priceName: any;
    productId: string;
    productName: string;
    productName2: string;
    productPrices: ProductPrice[];
    productGroupId: string;
    posScreenId: string;
    productImage: string;
    imageFile: any | null;
    discount: number;
    vat: number;
    branchId: string;
    companyId: string;
    isDeleted: boolean;
    status: boolean;
    errors: any[];
  }
  
  export interface ProductPrice {
    additions: never[];
    priceName: any;
    productPriceId: string;
    productPriceName: string | null;
    lineType: number;
    price: number | null;
    priceComments: PriceComment[];
    qtyToSelect: number;
    priceGroups: any[];
    groupPriceType: number;
    groupPrice: number;
    branchId: string;
    companyId: string;
    isDeleted: boolean;
    status: boolean;
    errors: any[];
  }
  
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
  