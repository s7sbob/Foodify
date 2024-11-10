// src/components/Sidebar/MenuItems.ts

import {
  IconUserCircle,
  IconUser,
  IconApps,
  IconDatabase,
  IconSquare,
  IconTruckDelivery,
  IconPlaceholder,
} from '@tabler/icons-react';

export interface MenuitemsType {
  id: string; // Make id required for better handling
  navlabel?: boolean;
  subheader?: string; // Use translation keys
  title?: string; // Use translation keys
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

// Function to generate menu items with translation keys
const Menuitems: MenuitemsType[] = [
  {
    id: 'main-data',
    navlabel: true,
    subheader: 'menu.mainData', // Translation key
  },

  // Menu group: Account
  {
    id: 'account',
    title: 'menu.account', // Translation key
    icon: IconUserCircle,
    href: '#',
    children: [
      {
        id: 'account-users',
        title: 'menu.accountUsers', // Translation key
        icon: IconUser,
        href: '/react-tables/column-visiblity',
      },
    ],
  },

  // Menu item: Company
  {
    id: 'company',
    title: 'menu.company', // Translation key
    icon: IconApps,
    href: '/pages/Company',
  },

  // Updated ProductsPage Menu Item
  {
    id: 'products', // Changed from 'ProductsPage' to 'products' for consistency
    title: 'menu.productPage', // Ensure this translation key exists
    icon: IconApps,
    href: '/productsPage', // Updated path to match the new route
  },

  {
    id: 'products', // Changed from 'ProductsPage' to 'products' for consistency
    title: 'menu.products', // Ensure this translation key exists
    icon: IconApps,
    href: '/products', // Updated path to match the new route
  },

  // Menu group: POS
  {
    id: 'pos',
    title: 'menu.pos', // Translation key
    icon: IconApps,
    href: '#',
    children: [
      {
        id: 'pos-data',
        title: 'menu.posData', // Translation key
        icon: IconDatabase,
        href: '#',
        children: [
          {
            id: 'pos-data-product-group',
            title: 'menu.posDataProductGroup', // Translation key
            icon: IconSquare,
            href: '/pages/treeview',
          },
          {
            id: 'pos-data-pos-screens',
            title: 'menu.posDataPOSScreens', // Translation key
            icon: IconSquare,
            href: '/pages/POSScreen',
          },
          {
            id: 'pos-data-pilot-list',
            title: 'menu.posDataPilotList', // Translation key
            icon: IconTruckDelivery,
            href: '/react-tables/PilotListTable',
          },
          {
            id: 'pos-data-zone-list',
            title: 'menu.posDataZoneList', // Translation key
            icon: IconPlaceholder,
            href: '/react-tables/ZoneListTable',
          },
          {
            id: 'pos-data-waiters-list',
            title: 'menu.posDataWaitersList', // Translation key
            icon: IconPlaceholder,
            href: '/react-tables/WaitersPage',
          },
          {
            id: 'pos-data-tables-section-list',
            title: 'menu.posDataTablesSectionList', // Translation key
            icon: IconPlaceholder,
            href: '/react-tables/TableSectionListTable',
          },
          {
            id: 'pos-data-tables-list',
            title: 'menu.posDataTablesList', // Translation key
            icon: IconPlaceholder,
            href: '/react-tables/TableListTable',
          },
        ],
      },
    ],
  },
];

export default Menuitems;
