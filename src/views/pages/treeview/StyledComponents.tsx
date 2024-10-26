// src/pages/StyledComponents.tsx

import { SvgIconProps } from '@mui/material/SvgIcon';
import { alpha, styled } from '@mui/material/styles';
import { TreeItem, treeItemClasses, TreeItemProps } from '@mui/lab';
import { useSpring, animated } from 'react-spring';
import { Collapse } from '@mui/material';
import { Folder, FolderPlus, FolderMinus } from 'react-feather';

export function MinusSquare(props: SvgIconProps) {
  return <FolderMinus style={{ width: 40, height: 40, color: '#e74c3c' }} {...props} />;
}

export function PlusSquare(props: SvgIconProps) {
  return <FolderPlus style={{ width: 40, height: 40, color: '#2ecc71' }} {...props} />;
}

export function CloseSquare(props: SvgIconProps) {
  return <Folder style={{ width: 40, height: 40, color: '#3498db' }} {...props} />;
}

function TransitionComponent(props: any) {
  const style = useSpring({
    from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

export const StyledTreeItem = styled((props: TreeItemProps) => (
  <TreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& svg': {
      fontSize: 40,
    },
  },
  [`& .${treeItemClasses.label}`]: {
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));
