// src/pages/TreeViewComponent.tsx

import React from 'react';
import { TreeView } from '@mui/lab';
import { Typography } from '@mui/material';
import { StyledTreeItem, MinusSquare, PlusSquare, CloseSquare } from './StyledComponents';
import { TreeNode } from './types';

type TreeViewComponentProps<T> = {
  data: TreeNode<T>[];
  onNodeSelect: (nodeId: string) => void;
};

function TreeViewComponent<T extends { color?: string }>({
  data,
  onNodeSelect,
}: TreeViewComponentProps<T>) {
  const renderTree = (nodes: TreeNode<T>[]) =>
    nodes.map((node) => (
      <StyledTreeItem
        key={node.nodeId}
        nodeId={node.nodeId}
        label={
          <Typography
            style={{
              color: node.info.color || 'inherit',
              fontSize: '1.2em',
              fontWeight: 'bold',
            }}
          >
            {node.label}
          </Typography>
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
