// src/utils/getImageUrl.ts

import { BASE_IMAGE_URL } from '../config';

export const getImageUrl = (path: string) => {
  // إزالة `/` من بداية المسار إذا كانت موجودة
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return `${BASE_IMAGE_URL}/${path}`;
};
