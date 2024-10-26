// src/components/Sidebar/NavGroup.tsx

import  { FC } from 'react';
import { ListSubheader } from '@mui/material';
import { MenuitemsType } from '../MenuItems'; // Ensure correct import path

interface NavGroupProps {
  item: MenuitemsType;
  hideMenu: boolean;
}

const NavGroup: FC<NavGroupProps> = ({ item, hideMenu }) => {
  return (
    <ListSubheader
      component="div"
      inset={!hideMenu}
      sx={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'text.secondary',
        textTransform: 'uppercase',
        py: 1.5,
        px: 2.5,
      }}
    >
      {item.subheader}
    </ListSubheader>
  );
};

export default NavGroup;
