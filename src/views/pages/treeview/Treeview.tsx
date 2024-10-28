// src/pages/Treeview.tsx

import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  FormControl,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import ParentCard from 'src/components/shared/ParentCard';
import ChildCard from 'src/components/shared/ChildCard';
import { AppState, useSelector } from 'src/store/Store';
import TreeViewComponent from './TreeViewComponent';
import InfoPreviewComponent from './InfoPreviewComponent';
import { TreeNode, ProductGroupInfo } from './types';
import tinycolor from 'tinycolor2';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../axiosConfig';
import ImageWithFallback from './ImageWithFallback';
import { normalizeImagePath } from './pathUtils';

// Updated interface
interface ProductGroupFormData {
  groupName: string;
  groupParentID?: string | null;
  color: string;
  file?: File | null; // Changed from imageFile to file
}

const Treeview: React.FC = () => {
  const [data, setData] = useState<TreeNode<ProductGroupInfo>[]>([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<ProductGroupInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProductGroupFormData>({
    groupName: '',
    groupParentID: null,
    color: '#000000',
    file: null, // Changed from imageFile to file
  });
  const [imageError, setImageError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [companyData, setCompanyData] = useState<any>(null);

  // Loading states
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
  const [isAddLoading, setIsAddLoading] = useState<boolean>(false);

  // Use the Notification Context
  const { showNotification } = useNotification();

  // Retrieve baseurl and token from the Redux store
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);

  useEffect(() => {
    if (baseurl && token) {
      fetchTreeData();
      fetchCompanyData();
    }
  }, [baseurl, token]);

  const fetchTreeData = async () => {
    try {
      const response = await api.get('/ProductGroups/GetAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const apiData: ProductGroupInfo[] = response.data;
      const { treeData } = mapApiDataToTreeNodes(apiData);
      setData(treeData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showNotification(
        error.message || 'Failed to fetch Product Groups.',
        'error',
        'Error'
      );
    }
  };

  const fetchCompanyData = async () => {
    try {
      const response = await api.get('/Company/GetCompanyData', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const company = response.data;
      setCompanyData(company);
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      showNotification('Failed to fetch company data.', 'error', 'Error');
    }
  };

  function mapApiDataToTreeNodes(apiData: ProductGroupInfo[]): { treeData: TreeNode<ProductGroupInfo>[] } {
    const nodesById: { [key: string]: TreeNode<ProductGroupInfo> } = {};
    const rootNodes: TreeNode<ProductGroupInfo>[] = [];

    // Create nodes and store by ID
    apiData.forEach((item) => {
      nodesById[item.groupId] = {
        nodeId: item.groupId,
        label: item.groupName,
        info: item,
        children: [],
      };
    });

    // Link children to parents
    apiData.forEach((item) => {
      const node = nodesById[item.groupId];
      const parentId = item.groupParentID;

      if (parentId && nodesById[parentId]) {
        nodesById[parentId].children.push(node);
      } else {
        // Root node
        rootNodes.push(node);
      }
    });

    return { treeData: rootNodes };
  }

  const findNodeById = (nodes: TreeNode<ProductGroupInfo>[], id: string): ProductGroupInfo | null => {
    for (const node of nodes) {
      if (node.nodeId === id) {
        return node.info;
      } else if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleNodeSelect = (nodeId: string) => {
    const findNode = (nodes: TreeNode<ProductGroupInfo>[]): TreeNode<ProductGroupInfo> | null => {
      for (const node of nodes) {
        if (node.nodeId === nodeId) {
          return node;
        } else if (node.children && node.children.length > 0) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const node = findNode(data);
    if (node) {
      // Set parentGroupName by finding the parent node
      let parentGroupName = '';
      if (node.info.groupParentID) {
        const parentNodeInfo = findNodeById(data, node.info.groupParentID);
        if (parentNodeInfo) {
          parentGroupName = parentNodeInfo.groupName;
        }
      }
      setSelectedNodeInfo({
        ...node.info,
        parentGroupName,
      });
    }
  };

  // Handle Edit
  const handleEdit = () => {
    if (selectedNodeInfo) {
      setFormData({
        groupName: selectedNodeInfo.groupName,
        groupParentID: selectedNodeInfo.groupParentID || null,
        color: selectedNodeInfo.color || '#000000',
        file: null, // Changed from imageFile to file
      });
      setImagePreview(selectedNodeInfo.img || '');
      setImageError('');
      setIsEditDialogOpen(true);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (group: Partial<ProductGroupFormData>) => {
    // Validation: Ensure groupName is provided
    if (!group.groupName || group.groupName.trim() === '') {
      showNotification('Group name is required.', 'warning', 'Warning');
      return;
    }

    // Ensure color is defined, else set to default
    const color = group.color ?? '#000000';

    console.log("Submitting group data:", group); // Debug log

    try {
      setIsAddLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('groupName', group.groupName);
      formDataToSend.append('color', color); // Use the ensured color

      if (group.groupParentID) {
        formDataToSend.append('groupParentID', group.groupParentID);
      }
      if (group.file) { // Changed from imageFile to file
        formDataToSend.append('file', group.file);
      }

      // Debug: Log FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      await api.post('/ProductGroups/AddProductGroup', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Refetch the tree data
      fetchTreeData();
      showNotification('Product Group added successfully!', 'success', 'Success');
    } catch (error: any) {
      console.error('Error adding Product Group:', error);

      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add Product Group.';
      showNotification(errorMessage, 'error', 'Error');

      throw error;
    } finally {
      setIsAddLoading(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!token) {
      console.warn('No token available. Cannot perform edit operation.');
      showNotification('Authentication token missing. Please log in.', 'error', 'Error');
      return;
    }

    try {
      setIsEditLoading(true);
      const hexColor = tinycolor(formData.color).toHexString();

      const formDataToSend = new FormData();
      formDataToSend.append('groupId', selectedNodeInfo?.groupId || '');
      formDataToSend.append('groupName', formData.groupName);
      formDataToSend.append('color', hexColor);

      if (formData.groupParentID) {
        formDataToSend.append('groupParentID', formData.groupParentID);
      }
      if (formData.file) { // Changed from imageFile to file
        formDataToSend.append('file', formData.file);
      }

      // Debug: Log FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      await api.post('/ProductGroups/UpdateProductGroup', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Refetch the tree data
      fetchTreeData();
      setIsEditDialogOpen(false);
      showNotification('Product Group updated successfully!', 'success', 'Success');
    } catch (error: any) {
      console.error('Error updating Product Group:', error);

      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update Product Group.';
      showNotification(errorMessage, 'error', 'Error');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Handle Image Change
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file); // Debug log

      // Validate file type (optional)
      if (!file.type.startsWith('image/')) {
        setImageError('Only image files are allowed.');
        return;
      }

      // Validate file size (optional, e.g., max 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        setImageError('Image size should be less than 2MB.');
        return;
      }

      // Clear previous errors
      setImageError('');

      // Update formData with the new image file
      setFormData((prev: ProductGroupFormData) => ({
        ...prev,
        file: file, // Changed from imageFile to file
      }));

      // Generate a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Debug: Log the selected file
      console.log("Selected image file:", file);
    }
  };

  // Handle Add Root Group
  const handleAddRootGroup = () => {
    setFormData({
      groupName: '',
      groupParentID: null,
      color: '#000000',
      file: null, // Changed from imageFile to file
    });
    setImagePreview('');
    setImageError('');
    setIsAddDialogOpen(true);
  };

  // Handle Add Sub-Group
  const handleAddSubGroup = () => {
    if (selectedNodeInfo) {
      setFormData({
        groupName: '',
        groupParentID: selectedNodeInfo.groupId, // Set groupParentID to selected node's id
        color: '#000000',
        file: null, // Changed from imageFile to file
      });
      setImagePreview('');
      setImageError('');
      setIsAddDialogOpen(true);
    } else {
      showNotification('Please select a group to add a sub-group.', 'warning', 'Warning');
    }
  };

  // Handle Add Dialog Close
  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setFormData({
      groupName: '',
      groupParentID: null,
      color: '#000000',
      file: null, // Changed from imageFile to file
    });
    setImagePreview('');
    setImageError('');
  };

  // Handle Add Dialog Submit
  const handleAddDialogSubmit = async () => {
    try {
      await handleAddSubmit(formData);
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error notification already handled in handleAddSubmit
    }
  };

  return (
    <PageContainer title="Product Groups" description="Manage Product Groups">
      <ParentCard title="Product Groups">
        <ChildCard>
          {/* Add New Group Button */}
          <div style={{ marginBottom: '1em' }}>
            <Button variant="contained" color="primary" onClick={handleAddRootGroup}>
              Add New Group
            </Button>
          </div>
          <div style={{ display: 'flex', height: '400px' }}>
            {/* TreeView Side */}
            <div style={{ width: '40%', overflowY: 'auto' }}>
              <TreeViewComponent<ProductGroupInfo> data={data} onNodeSelect={handleNodeSelect} />
            </div>
            {/* Info Preview Side */}
            <div
              style={{
                width: '60%',
                padding: '1em',
                borderLeft: '1px solid #ccc',
                overflowY: 'auto',
              }}
            >
              <InfoPreviewComponent
                selectedNodeInfo={selectedNodeInfo}
                onEdit={handleEdit}
                onAdd={handleAddSubGroup}
              />
            </div>
          </div>

          {/* Edit Dialog */}
          <Dialog
            open={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Edit Product Group</DialogTitle>
            <DialogContent>
              {selectedNodeInfo?.groupParentID && (
                <TextField
                  label="Parent Group"
                  value={selectedNodeInfo.parentGroupName || ''}
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label="Group Name"
                value={formData.groupName || ''}
                onChange={(e) => {
                  setFormData({ ...formData, groupName: e.target.value });
                  console.log("Updated formData.groupName:", e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Color"
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#000000'}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  console.log("Updated formData.color:", e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              {/* Image Upload Field */}
              <FormControl fullWidth margin="normal">
                <InputLabel shrink htmlFor="image-upload">
                  Image
                </InputLabel>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: '16px' }}
                />
                {imageError && <FormHelperText error>{imageError}</FormHelperText>}
                {imagePreview && (
                  <ImageWithFallback
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '25%', marginTop: '1em' }}
                  />
                )}
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditDialogOpen(false)} disabled={isEditLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                color="primary"
                variant="contained"
                disabled={isEditLoading}
              >
                {isEditLoading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Dialog */}
          <Dialog
            open={isAddDialogOpen}
            onClose={handleAddDialogClose}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>
              {formData.groupParentID ? 'Add New Sub-Group' : 'Add New Group'}
            </DialogTitle>
            <DialogContent>
              {formData.groupParentID && (
                <TextField
                  label="Parent Group"
                  value={selectedNodeInfo?.groupName || ''}
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label="Group Name"
                value={formData.groupName || ''}
                onChange={(e) => {
                  setFormData({ ...formData, groupName: e.target.value });
                  console.log("Updated formData.groupName:", e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Color"
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#000000'}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  console.log("Updated formData.color:", e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              {/* Image Upload Field */}
              <FormControl fullWidth margin="normal">
                <InputLabel shrink htmlFor="image-upload">
                  Image
                </InputLabel>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginTop: '16px' }}
                />
                {imageError && <FormHelperText error>{imageError}</FormHelperText>}
                {imagePreview && (
                  <ImageWithFallback
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '25%', marginTop: '1em' }}
                  />
                )}
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddDialogClose} disabled={isAddLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDialogSubmit}
                color="primary"
                variant="contained"
                disabled={isAddLoading}
              >
                {isAddLoading ? <CircularProgress size={24} /> : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
        </ChildCard>
      </ParentCard>
    </PageContainer>
  );
};

export default Treeview;
