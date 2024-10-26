// src/components/Sidebar/NavItem.tsx

import  { FC } from 'react';
import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { MenuitemsType } from '../MenuItems'; // Ensure correct import path
import { useNavigate } from 'react-router-dom';

interface NavItemProps {
  item: MenuitemsType;
  pathDirect: string;
  hideMenu: boolean;
  onClick: () => void;
  level: number;
}

const NavItem: FC<NavItemProps> = ({
  item,
  pathDirect,
  hideMenu,
  onClick,
  level,
}) => {
  const navigate = useNavigate();
  const isSelected = pathDirect === item.href;

  const handleNavigation = () => {
    if (item.href && item.href !== '#') {
      navigate(item.href);
    }
    onClick();
  };

  return (
    <ListItemButton
      onClick={handleNavigation}
      selected={isSelected}
      sx={{ pl: 2 + level * 2 }}
    >
      {item.icon && (
        <ListItemIcon>
          <Tooltip title={hideMenu ? item.title : ''} placement="right">
            <item.icon size={20} />
          </Tooltip>
        </ListItemIcon>
      )}
      <ListItemText primary={item.title} />
    </ListItemButton>
  );
};

export default NavItem;
