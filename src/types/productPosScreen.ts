// src/types/productPosScreen.ts

export interface ProductPosScreen {
    screenId: string;
    screenName: string;
    parentScreenId: string | null;
    textColor: string | null;
    color: string;
    img: string;
    order: number;
    imageFile: any | null;
    isDeleted: boolean;
    status: boolean;
    errors: any[];
  }
  