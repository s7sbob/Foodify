// src/pages/InfoPreviewComponent.tsx

import React from 'react';
import { Button, Typography } from '@mui/material';
import ImageWithFallback from './ImageWithFallback';
import { normalizeImagePath } from './pathUtils';

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
  if (!selectedNodeInfo) {
    return (
      <Typography variant="body1">Select a node to see its details.</Typography>
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
      <Typography variant="h6">Details</Typography>
      {selectedNodeInfo.screenName ? (
        <>
          <Typography>
            <strong>Screen Name:</strong> {selectedNodeInfo.screenName}
          </Typography>
          {selectedNodeInfo.parentScreenName && (
            <Typography>
              <strong>Parent Screen:</strong> {selectedNodeInfo.parentScreenName}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography>
            <strong>Group Name:</strong> {selectedNodeInfo.groupName}
          </Typography>
          {selectedNodeInfo.parentGroupName && (
            <Typography>
              <strong>Parent Group:</strong> {selectedNodeInfo.parentGroupName}
            </Typography>
          )}
        </>
      )}
      <Typography>
        <strong>Color:</strong>{' '}
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
            <strong>Image:</strong>
          </Typography>
          <ImageWithFallback
            src={imageUrl}
            alt={selectedNodeInfo.screenName || selectedNodeInfo.groupName || "Group"}
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
          Edit
        </Button>
        <Button variant="contained" color="secondary" onClick={onAdd}>
          Add New Branch
        </Button>
      </div>
    </div>
  );
};

export default InfoPreviewComponent;
