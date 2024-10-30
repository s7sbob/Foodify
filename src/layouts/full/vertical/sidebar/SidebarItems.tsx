// src/components/Sidebar/SidebarItems.tsx

import React from 'react';
import { useLocation } from 'react-router';
import { Box, List } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import NavItem from './NavItem/NavItem';
import NavCollapse from './NavCollapse/NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { AppState } from 'src/store/Store';
import Menuitems, { MenuitemsType } from './MenuItems';
import { useTranslation } from 'react-i18next';

const SidebarItems: React.FC = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Helper function to ensure t returns a string
  const getTranslatedString = (key?: string): string | undefined => {
    if (!key) return undefined;
    const translated = t(key);
    return typeof translated === 'string' ? translated : undefined;
  };

  // Function to translate menu items
  const translateMenuItems = (items: MenuitemsType[]): MenuitemsType[] => {
    return items.map((item) => {
      const translatedItem: MenuitemsType = { ...item };
      if (item.subheader) {
        translatedItem.subheader = getTranslatedString(item.subheader);
      }
      if (item.title) {
        translatedItem.title = getTranslatedString(item.title);
      }
      if (item.children) {
        translatedItem.children = translateMenuItems(item.children);
      }
      return translatedItem;
    });
  };

  const translatedMenuItems = translateMenuItems(Menuitems);

  const hideMenu: boolean = customizer.isCollapse && !customizer.isSidebarHover;

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {translatedMenuItems.map((item) => {
          // SubHeader
          if (item.navlabel) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.id || item.subheader} />;
          }
          // If Sub Menu
          else if (item.children) {
            return (
              <NavCollapse
                key={item.id}
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );
          }
          // If Single Menu Item
          else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => dispatch(toggleMobileSidebar())}
                level={1}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
