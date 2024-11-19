// src/pages/types.ts

export interface POSScreenInfo {
  screenId: string;
  screenName: string;
  parentScreenId?: string;
  parentScreenName?: string; // Added for display purposes
  color: string;
  textColor?: string; // Added for text color
  img?: string;
  // Add other relevant fields as needed
}

export interface ProductGroupInfo {
  order: number;
  screenName: any;
  screenId: any;
  groupId: string;
  groupName: string;
  groupParentID?: string;
  parentGroupName?: string; // Added for display purposes
  color: string;
  textColor?: string; // Added for text color
  img?: string;
  // Add other relevant fields as needed
}

// Made TreeNode generic
export interface TreeNode<T> {
  nodeId: string;
  label: string;
  info: T;
  children: TreeNode<T>[];
}

// Update the ProductGroupFormData interface to include 'order' and 'textColor'
export interface ProductGroupFormData {
  groupName: string;
  groupParentID?: string | null;
  color: string;
  textColor: string; // Added textColor
  order: number; // Added order
  file?: File | null; // Changed from imageFile to file
}
