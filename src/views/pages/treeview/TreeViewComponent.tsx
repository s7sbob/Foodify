// src/pages/TreeViewComponent.tsx

import React from 'react';
import { TreeView } from '@mui/lab';
import { Typography } from '@mui/material';
import { StyledTreeItem, MinusSquare, PlusSquare, CloseSquare } from './StyledComponents';
import { TreeNode } from './types';
import ImageWithFallback from './ImageWithFallback';
import { normalizeImagePath } from './pathUtils';

type TreeViewComponentProps<T> = {
  data: TreeNode<T>[];
  onNodeSelect: (nodeId: string) => void;
};

function TreeViewComponent<T extends {
  textColor?: string; color?: string; img?: string 
}>({
  data,
  onNodeSelect,
}: TreeViewComponentProps<T>) {
  const renderTree = (nodes: TreeNode<T>[]) =>
    nodes.map((node) => (
      <StyledTreeItem
        key={node.nodeId}
        nodeId={node.nodeId}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Image in Tree Node (Optional) */}
            {node.info.img && (
              <ImageWithFallback
                src={`https://erp.ts-egy.com${normalizeImagePath(node.info.img)}`}
                alt={node.label}
                style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '8px',
                  borderRadius: '50%',
                }}
              />
            )}
            <Typography
              style={{
                color: node.info.textColor || 'inherit',
                fontSize: '1.2em',
                fontWeight: 'bold',
              }}
            >
              {node.label}
            </Typography>
          </div>
        }
      >
        {node.children && node.children.length > 0 && renderTree(node.children)}
      </StyledTreeItem>
    ));

  const handleNodeSelect = (_event: React.SyntheticEvent, nodeId: string) => {
    onNodeSelect(nodeId);
  };

  return (
    <TreeView
      aria-label="customized"
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<CloseSquare />}
      sx={{ height: '100%', flexGrow: 1, overflowY: 'auto' }}
      onNodeSelect={handleNodeSelect}
    >
      {renderTree(data)}
    </TreeView>
  );
}

export default TreeViewComponent;
