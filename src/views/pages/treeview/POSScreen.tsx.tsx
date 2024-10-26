// src/pages/POSScreen.tsx

import React, { useState, useEffect, ChangeEvent } from 'react';
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
import { useSelector } from '../../../store/Store';
import TreeViewComponent from './TreeViewComponent';
import InfoPreviewComponent from './InfoPreviewComponent';
import { TreeNode, POSScreenInfo } from './types';
import tinycolor from 'tinycolor2';
import { useNotification } from '../../../context/NotificationContext';
import api from '../../../axiosConfig';

const POSScreen: React.FC = () => {
  const [data, setData] = useState<TreeNode<POSScreenInfo>[]>([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<POSScreenInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [imageError, setImageError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [companyData, setCompanyData] = useState<any>(null);

  // Loading states
  const [isEditLoading, setIsEditLoading] = useState<boolean>(false);
  const [isAddLoading, setIsAddLoading] = useState<boolean>(false);

  // Use the Notification Context
  const { showNotification } = useNotification();

  // Retrieve baseurl from the Redux store
  const baseurl = useSelector((state) => state.customizer.baseurl);

  useEffect(() => {
    if (baseurl) {
      fetchTreeData();
      fetchCompanyData();
    }
  }, [baseurl]);

  const fetchTreeData = async () => {
    try {
      const response = await api.get('/PosScreen/GetPosScreens');
      const apiData: POSScreenInfo[] = response.data;
      const { treeData } = mapApiDataToTreeNodes(apiData);
      setData(treeData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showNotification(
        error.message || 'Failed to fetch POS Screens.',
        'error',
        'Error'
      );
    }
  };

  const fetchCompanyData = async () => {
    try {
      const response = await api.get('/Company/GetCompanyData');
      const company = response.data;
      setCompanyData(company);
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      showNotification('Failed to fetch company data.', 'error', 'Error');
    }
  };

  function mapApiDataToTreeNodes(apiData: POSScreenInfo[]): { treeData: TreeNode<POSScreenInfo>[] } {
    const nodesById: { [key: string]: TreeNode<POSScreenInfo> } = {};
    const rootNodes: TreeNode<POSScreenInfo>[] = [];

    // Create nodes and store by ID
    apiData.forEach((item) => {
      nodesById[item.screenId] = {
        nodeId: item.screenId,
        label: item.screenName,
        info: item,
        children: [],
      };
    });

    // Link children to parents
    apiData.forEach((item) => {
      const node = nodesById[item.screenId];
      const parentId = item.parentScreenId;

      if (parentId && nodesById[parentId]) {
        nodesById[parentId].children.push(node);
      } else {
        // Root node
        rootNodes.push(node);
      }
    });

    return { treeData: rootNodes };
  }

  const findNodeById = (nodes: TreeNode<POSScreenInfo>[], id: string): POSScreenInfo | null => {
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
    const findNode = (nodes: TreeNode<POSScreenInfo>[]): TreeNode<POSScreenInfo> | null => {
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
      // Set parentScreenName by finding the parent node
      let parentScreenName = '';
      if (node.info.parentScreenId) {
        const parentNodeInfo = findNodeById(data, node.info.parentScreenId);
        if (parentNodeInfo) {
          parentScreenName = parentNodeInfo.screenName;
        }
      }
      setSelectedNodeInfo({
        ...node.info,
        parentScreenName,
      });
    }
  };

  // Handle Edit
  const handleEdit = () => {
    if (selectedNodeInfo) {
      setFormData({
        screenId: selectedNodeInfo.screenId,
        screenName: selectedNodeInfo.screenName,
        parentScreenName: selectedNodeInfo.parentScreenName || '',
        parentScreenId: selectedNodeInfo.parentScreenId || '',
        color: selectedNodeInfo.color || '#000000',
        img: selectedNodeInfo.img || '', // Image path for display
        imageFile: null, // Reset imageFile to null; only append if a new image is uploaded
      });
      setImagePreview(selectedNodeInfo.img || '');
      setIsEditDialogOpen(true);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (screen: Partial<any>) => {
    try {
      setIsAddLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('screenName', screen.screenName);
      formDataToSend.append('color', screen.color);

      if (screen.parentScreenId) {
        formDataToSend.append('parentScreenId', screen.parentScreenId);
      }
      if (screen.imageFile) {
        formDataToSend.append('imageFile', screen.imageFile);
      }

      await api.post('/PosScreen/CreatePosScreen', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refetch the tree data
      fetchTreeData();
      showNotification('POS Screen added successfully!', 'success', 'Success');
    } catch (error: any) {
      console.error('Error adding POS Screen:', error);

      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add POS Screen.';
      showNotification(errorMessage, 'error', 'Error');

      throw error;
    } finally {
      setIsAddLoading(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    try {
      setIsEditLoading(true);
      const hexColor = tinycolor(formData.color).toHexString(); // Ensure color is in HEX format

      const formDataToSend = new FormData();
      formDataToSend.append('screenId', formData.screenId);
      formDataToSend.append('screenName', formData.screenName);
      formDataToSend.append('color', hexColor);

      if (formData.parentScreenId) {
        formDataToSend.append('parentScreenId', formData.parentScreenId);
      }
      if (formData.imageFile) {
        formDataToSend.append('imageFile', formData.imageFile);
      }

      await api.post('/PosScreen/UpdatePosScreen', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refetch the tree data
      fetchTreeData();
      setIsEditDialogOpen(false);
      showNotification('POS Screen updated successfully!', 'success', 'Success');
    } catch (error: any) {
      console.error('Error updating POS Screen:', error);

      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update POS Screen.';
      showNotification(errorMessage, 'error', 'Error');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Rest of your code remains the same...

  // Handle Image Change
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
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
      setFormData((prev: any) => ({
        ...prev,
        imageFile: file, // Store the File object
      }));

      // Generate a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Root Screen
  const handleAddRootScreen = () => {
    setFormData({
      screenName: '',
      parentScreenId: null,
      parentScreenName: '',
      color: '#000000',
      img: '', // Image path for display
      imageFile: null, // Image file for upload
    });
    setImagePreview('');
    setImageError('');
    setIsAddDialogOpen(true);
  };

  // Handle Add Sub-Screen
  const handleAddSubScreen = () => {
    if (selectedNodeInfo) {
      setFormData({
        screenName: '',
        parentScreenId: selectedNodeInfo.screenId, // Set parentScreenId to selected node's id
        parentScreenName: selectedNodeInfo.screenName,
        color: '#000000',
        img: '', // Image path for display
        imageFile: null, // Image file for upload
      });
      setImagePreview('');
      setImageError('');
      setIsAddDialogOpen(true);
    } else {
      showNotification('Please select a screen to add a sub-screen.', 'warning', 'Warning');
    }
  };

  // Handle Add Dialog Close
  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setFormData({});
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
    <PageContainer title="POS Screen" description="This is POS Screen page">
      <ParentCard title="POS Screen">
        <ChildCard>
          {/* Add New Screen Button */}
          <div style={{ marginBottom: '1em' }}>
            <Button variant="contained" color="primary" onClick={handleAddRootScreen}>
              Add New Screen
            </Button>
          </div>
          <div style={{ display: 'flex', height: '400px' }}>
            {/* TreeView Side */}
            <div style={{ width: '40%', overflowY: 'auto' }}>
              <TreeViewComponent<POSScreenInfo> data={data} onNodeSelect={handleNodeSelect} />
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
                onAdd={handleAddSubScreen}
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
            <DialogTitle>Edit POS Screen</DialogTitle>
            <DialogContent>
              {formData.parentScreenName && (
                <TextField
                  label="Parent Screen"
                  value={formData.parentScreenName}
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label="Screen Name"
                value={formData.screenName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, screenName: e.target.value })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Color"
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#000000'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                  <img
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
              {formData.parentScreenId ? 'Add New Sub-Screen' : 'Add New Screen'}
            </DialogTitle>
            <DialogContent>
              {formData.parentScreenName && (
                <TextField
                  label="Parent Screen"
                  value={formData.parentScreenName}
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label="Screen Name"
                value={formData.screenName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, screenName: e.target.value })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Color"
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#000000'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                  <img
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

export default POSScreen;
