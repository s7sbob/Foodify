// src/utils/pathUtils.ts

/**
 * Normalizes the image path to ensure it starts with a leading slash.
 * @param path - The image path from the API.
 * @returns The normalized image path.
 */
export const normalizeImagePath = (path: string): string => {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    return path;
  };
  