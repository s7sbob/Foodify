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
import ImageWithFallback from './ImageWithFallback';
import { normalizeImagePath } from './pathUtils';
import { useTranslation } from 'react-i18next';

const POSScreen: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<TreeNode<POSScreenInfo>[]>([]);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<POSScreenInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    screenName: '',
    parentScreenId: null,
    parentScreenName: '',
    color: '#FFFFFF', // Default background color
    textColor: '#000000', // Default text color (brown)
    img: '',
    imageFile: null,
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
  const baseurl = useSelector((state: any) => state.customizer.baseurl);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    if (baseurl && token) {
      fetchTreeData();
      fetchCompanyData();
    }
  }, [baseurl, token]);

  const fetchTreeData = async () => {
    try {
      const response = await api.get('/PosScreen/GetPosScreens', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const apiData: POSScreenInfo[] = response.data;
      const { treeData } = mapApiDataToTreeNodes(apiData);
      setData(treeData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      showNotification(
        error.message || t('notifications.fetchPOSScreensFailed'),
        t('common.error')
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
      showNotification(t('notifications.fetchCompanyDataFailed'), t('common.error'));
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
        color: selectedNodeInfo.color || '#FFFFFF', // Default to white
        textColor: selectedNodeInfo.textColor || '#000000', // Default to brown
        img: selectedNodeInfo.img || '',
        imageFile: null,
      });
      setImagePreview(selectedNodeInfo.img || '');
      setIsEditDialogOpen(true);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (screen: Partial<any>) => {
    // Validation: Ensure screenName is provided
    if (!screen.screenName || screen.screenName.trim() === '') {
      showNotification(t('notifications.screenNameRequired'), t('common.warning'));
      return;
    }

    console.log('Submitting screen data:', screen);

    // Ensure color and textColor are defined, else set to default
    const color = screen.color ?? '#FFFFFF'; // Default to white
    const textColor = screen.textColor ?? '#000000'; // Default to brown

    try {
      setIsAddLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('screenName', screen.screenName);
      formDataToSend.append('color', color);
      formDataToSend.append('textColor', textColor); // Append textColor

      if (screen.parentScreenId) {
        formDataToSend.append('parentScreenId', screen.parentScreenId);
      }
      if (screen.imageFile) {
        formDataToSend.append('imageFile', screen.imageFile);
      }

      // Debug: Log FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      await api.post('/PosScreen/CreatePosScreen', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Refetch the tree data
      fetchTreeData();
      showNotification(t('notifications.posScreenAddedSuccess'), t('common.success'));
    } catch (error: any) {
      console.error('Error adding POS Screen:', error);

      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || t('notifications.posScreenAddFailed');
      showNotification(errorMessage, t('common.error'));

      throw error;
    } finally {
      setIsAddLoading(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    try {
      setIsEditLoading(true);
      const hexColor = tinycolor(formData.color).toHexString();
      const hexTextColor = tinycolor(formData.textColor).toHexString();

      const formDataToSend = new FormData();
      formDataToSend.append('screenId', formData.screenId);
      formDataToSend.append('screenName', formData.screenName);
      formDataToSend.append('color', hexColor);
      formDataToSend.append('textColor', hexTextColor); // Append textColor

      if (formData.parentScreenId) {
        formDataToSend.append('parentScreenId', formData.parentScreenId);
      }
      if (formData.imageFile) {
        formDataToSend.append('imageFile', formData.imageFile);
      }

      // Debug: Log FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      await api.post('/PosScreen/UpdatePosScreen', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Refetch the tree data
      fetchTreeData();
      setIsEditDialogOpen(false);
      showNotification(t('notifications.posScreenUpdatedSuccess'), t('common.success'));
    } catch (error: any) {
      console.error('Error updating POS Screen:', error);

      // Show detailed error message if available
      const errorMessage = error.response?.data?.message || error.message || t('notifications.posScreenUpdateFailed');
      showNotification(errorMessage, t('common.error'));
    } finally {
      setIsEditLoading(false);
    }
  };

  // Handle Image Change
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (optional)
      if (!file.type.startsWith('image/')) {
        setImageError(t('notifications.onlyImageFilesAllowed') as string);
        return;
      }

      // Validate file size (optional, e.g., max 2MB)
      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSizeInBytes) {
        setImageError(t('notifications.imageSizeLimit') as string);
        return;
      }

      // Clear previous errors
      setImageError('');

      // Update formData with the new image file
      setFormData((prev: any) => ({
        ...prev,
        imageFile: file,
      }));

      // Generate a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Debug: Log the selected file
      console.log('Selected image file:', file);
    }
  };

  // Handle Add Root Screen
  const handleAddRootScreen = () => {
    setFormData({
      screenName: '',
      parentScreenId: null,
      parentScreenName: '',
      color: '#FFFFFF', // Default background color
      textColor: '#000000', // Default text color (brown)
      img: '',
      imageFile: null,
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
        parentScreenId: selectedNodeInfo.screenId,
        parentScreenName: selectedNodeInfo.screenName,
        color: '#FFFFFF', // Default background color
        textColor: '#000000', // Default text color (brown)
        img: '',
        imageFile: null,
      });
      setImagePreview('');
      setImageError('');
      setIsAddDialogOpen(true);
    } else {
      showNotification(t('notifications.selectScreenToAddSubScreen'), t('common.warning'));
    }
  };

  // Handle Add Dialog Close
  const handleAddDialogClose = () => {
    setIsAddDialogOpen(false);
    setFormData({
      screenName: '',
      parentScreenId: null,
      parentScreenName: '',
      color: '#FFFFFF', // Default background color
      textColor: '#000000', // Default text color (brown)
      img: '',
      imageFile: null,
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
    <PageContainer description={t('posScreen.description')}>
      <ParentCard title={t('posScreen.title')}>
        <ChildCard>
          {/* Add New Screen Button */}
          <div style={{ marginBottom: '2em' }}>
            <Button variant="contained" color="primary" onClick={handleAddRootScreen}>
              {t('posScreen.addNewScreen')}
            </Button>
          </div>
          <div style={{ display: 'flex', height: '100%' }}>
            {/* TreeView Side */}
            <div style={{ width: '50%', overflowY: 'auto' }}>
              <TreeViewComponent<POSScreenInfo> data={data} onNodeSelect={handleNodeSelect} />
            </div>
            {/* Info Preview Side */}
            <div
              style={{
                width: '50%',
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
            <DialogTitle>{t('posScreen.editPOSScreen')}</DialogTitle>
            <DialogContent>
              {formData.parentScreenName && (
                <TextField
                  label={t('posScreen.parentScreen')}
                  value={formData.parentScreenName}
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label={t('posScreen.screenName')}
                value={formData.screenName || ''}
                onChange={(e) => {
                  setFormData({ ...formData, screenName: e.target.value });
                  console.log('Updated formData.screenName:', e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('posScreen.color')}
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#FFFFFF'}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  console.log('Updated formData.color:', e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('posScreen.textColor')}
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.textColor || '#000000'}
                onChange={(e) => {
                  setFormData({ ...formData, textColor: e.target.value });
                  console.log('Updated formData.textColor:', e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              {/* Image Upload Field */}
              <FormControl fullWidth margin="normal">
                <InputLabel shrink htmlFor="image-upload">
                  {t('posScreen.image')}
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
                {t('buttons.cancel')}
              </Button>
              <Button
                onClick={handleEditSubmit}
                color="primary"
                variant="contained"
                disabled={isEditLoading}
              >
                {isEditLoading ? <CircularProgress size={24} /> : t('buttons.save')}
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
              {formData.parentScreenId ? t('posScreen.addNewSubScreen') : t('posScreen.addNewScreen')}
            </DialogTitle>
            <DialogContent>
              {formData.parentScreenName && (
                <TextField
                  label={t('posScreen.parentScreen')}
                  value={formData.parentScreenName}
                  disabled
                  fullWidth
                  margin="normal"
                />
              )}
              <TextField
                label={t('posScreen.screenName')}
                value={formData.screenName || ''}
                onChange={(e) => {
                  setFormData({ ...formData, screenName: e.target.value });
                  console.log('Updated formData.screenName:', e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('posScreen.color')}
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.color || '#FFFFFF'}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  console.log('Updated formData.color:', e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label={t('posScreen.textColor')}
                type="color"
                InputLabelProps={{ shrink: true }}
                value={formData.textColor || '#000000'}
                onChange={(e) => {
                  setFormData({ ...formData, textColor: e.target.value });
                  console.log('Updated formData.textColor:', e.target.value);
                }}
                fullWidth
                margin="normal"
              />
              {/* Image Upload Field */}
              <FormControl fullWidth margin="normal">
                <InputLabel shrink htmlFor="image-upload">
                  {t('posScreen.image')}
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
                {t('buttons.cancel')}
              </Button>
              <Button
                onClick={handleAddDialogSubmit}
                color="primary"
                variant="contained"
                disabled={isAddLoading}
              >
                {isAddLoading ? <CircularProgress size={24} /> : t('buttons.add')}
              </Button>
            </DialogActions>
          </Dialog>
        </ChildCard>
      </ParentCard>
    </PageContainer>
  );
};

export default POSScreen;
