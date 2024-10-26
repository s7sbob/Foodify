// src/components/Sidebar/NavCollapse.tsx

import  { useState, FC } from 'react';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Tooltip,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { MenuitemsType } from '../MenuItems'; // Ensure correct import path
import NavItem from '../NavItem/NavItem';
import { useNavigate } from 'react-router-dom';

interface NavCollapseProps {
  menu: MenuitemsType;
  pathDirect: string;
  hideMenu: boolean;
  pathWithoutLastPart: string;
  level: number;
  onClick: () => void;
}

const NavCollapse: FC<NavCollapseProps> = ({
  menu,
  pathDirect,
  hideMenu,
  pathWithoutLastPart,
  level,
  onClick,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setOpen(!open);
  };

  const isSelected = pathDirect === menu.href;

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{ pl: 2 + level * 2 }}
        selected={isSelected}
      >
        {menu.icon && (
          <ListItemIcon>
            <Tooltip title={hideMenu ? menu.title : ''} placement="right">
              <menu.icon size={20} />
            </Tooltip>
          </ListItemIcon>
        )}
        <ListItemText primary={menu.title} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {menu.children?.map((subMenu) => {
            if (subMenu.children) {
              return (
                <NavCollapse
                  key={subMenu.id}
                  menu={subMenu}
                  pathDirect={pathDirect}
                  hideMenu={hideMenu}
                  pathWithoutLastPart={pathWithoutLastPart}
                  level={level + 1}
                  onClick={onClick}
                />
              );
            } else {
              return (
                <NavItem
                  key={subMenu.id}
                  item={subMenu}
                  pathDirect={pathDirect}
                  hideMenu={hideMenu}
                  onClick={onClick}
                  level={level + 1}
                />
              );
            }
          })}
        </List>
      </Collapse>
    </>
  );
};

export default NavCollapse;
