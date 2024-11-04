// src/pages/InfoPreviewComponent.tsx

import React from 'react';
import { Button, Typography } from '@mui/material';
import ImageWithFallback from './ImageWithFallback';
import { normalizeImagePath } from './pathUtils';
import { useTranslation } from 'react-i18next';

interface InfoPreviewProps {
  selectedNodeInfo: any;
  onEdit: () => void;
  onAdd: () => void;
}

const InfoPreviewComponent: React.FC<InfoPreviewProps> = ({
  selectedNodeInfo,
  onEdit,
  onAdd,
}) => {
  const { t } = useTranslation();

  if (!selectedNodeInfo) {
    return (
      <Typography variant="body1">{t('infoPreview.selectNode')}</Typography>
    );
  }

  // Normalize image path
  const imagePath = selectedNodeInfo.img ? normalizeImagePath(selectedNodeInfo.img) : null;
  const imageUrl = imagePath ? `https://erp.ts-egy.com${imagePath}` : null;

  // Debugging: Log the image URL
  console.log(
    `Image URL for node ${
      selectedNodeInfo.screenName || selectedNodeInfo.groupName
    }:`,
    imageUrl
  );

  return (
    <div>
      <Typography variant="h6">{t('infoPreview.details')}</Typography>
      {selectedNodeInfo.screenName ? (
        <>
          <Typography>
            <strong>{t('posScreen.screenName')}:</strong> {selectedNodeInfo.screenName}
          </Typography>
          {selectedNodeInfo.parentScreenName && (
            <Typography>
              <strong>{t('posScreen.parentScreen')}:</strong> {selectedNodeInfo.parentScreenName}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography>
            <strong>{t('productGroups.groupName')}:</strong> {selectedNodeInfo.groupName}
          </Typography>
          {selectedNodeInfo.parentGroupName && (
            <Typography>
              <strong>{t('productGroups.parentGroup')}:</strong> {selectedNodeInfo.parentGroupName}
            </Typography>
          )}
        </>
      )}
      <Typography>
        <strong>{t('common.color')}:</strong>{' '}
        <span
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            backgroundColor: selectedNodeInfo.color,
            border: '1px solid #000',
            marginLeft: '8px',
          }}
        ></span>
        {` ${selectedNodeInfo.color}`}
      </Typography>
      {imageUrl && (
        <div>
          <Typography>
            <strong>{t('common.image')}:</strong>
          </Typography>
          <ImageWithFallback
            src={imageUrl}
            alt={selectedNodeInfo.screenName || selectedNodeInfo.groupName || t('common.group')}
            style={{ maxWidth: '25%', marginTop: '1em' }}
          />
        </div>
      )}
      {/* Buttons */}
      <div style={{ marginTop: '1em' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onEdit}
          style={{ marginRight: '1em' }}
        >
          {t('buttons.edit')}
        </Button>
        <Button variant="contained" color="secondary" onClick={onAdd}>
          {t('buttons.addNewBranch')}
        </Button>
      </div>
    </div>
  );
};

export default InfoPreviewComponent;
