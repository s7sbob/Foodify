// src/components/Search/MenuItemRenderer.tsx

import React from 'react';
import { Box, ListItemButton, ListItemText, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { MenuitemsType } from '../sidebar/MenuItems';

interface MenuItemRendererProps {
  menu: MenuitemsType;
  level?: number;
}

const MenuItemRenderer: React.FC<MenuItemRendererProps> = ({ menu, level = 0 }) => {
  return (
    <Box key={menu.id} sx={{ pl: level * 2 }}>
      {/* Display subheader if present and no title */}
      {menu.navlabel && menu.subheader && (
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          {menu.subheader}
        </Typography>
      )}

      {/* Display menu item without children */}
      {menu.title && !menu.children && !menu.navlabel && (
        <ListItemButton
          sx={{ py: 0.5, px: 1 }}
          to={menu.href || '#'}
          component={Link}
        >
          <ListItemText
            primary={menu.title}
            secondary={menu.href}
            sx={{ my: 0, py: 0.5 }}
          />
        </ListItemButton>
      )}

      {/* Display menu items with children */}
      {menu.children && (
        <Box>
          {menu.children.map((child) => (
            <MenuItemRenderer key={child.id} menu={child} level={level + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MenuItemRenderer;
