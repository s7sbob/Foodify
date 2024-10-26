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
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}

const Menuitems: MenuitemsType[] = [
  {
    id: 'main-data',
    navlabel: true,
    subheader: 'Main data',
  },

  // Menu group: Account
  {
    id: 'account',
    title: 'Account',
    icon: IconUserCircle,
    href: '#',
    children: [
      {
        id: 'account-users',
        title: 'Users',
        icon: IconUser,
        href: '/react-tables/column-visiblity',
      },
    ],
  },

  // Menu item: Company
  {
    id: 'company',
    title: 'Company',
    icon: IconApps,
    href: '/pages/Company',
  },

  // Menu group: POS
  {
    id: 'pos',
    title: 'POS',
    icon: IconApps,
    href: '#',
    children: [
      {
        id: 'pos-data',
        title: 'Data',
        icon: IconDatabase,
        href: '#',
        children: [
          {
            id: 'pos-data-product-group',
            title: 'Product Group',
            icon: IconSquare,
            href: '/pages/treeview',
          },
          {
            id: 'pos-data-pos-screens',
            title: 'POS Screens',
            icon: IconSquare,
            href: '/pages/POSScreen',
          },
          {
            id: 'pos-data-pilot-list',
            title: 'Pilot List',
            icon: IconTruckDelivery,
            href: '/react-tables/PilotListTable',
          },
          {
            id: 'pos-data-zone-list',
            title: 'Zone List',
            icon: IconPlaceholder,
            href: '/react-tables/ZoneListTable',
          },
          {
            id: 'pos-data-waiters-list',
            title: 'Waiters List',
            icon: IconPlaceholder,
            href: '/react-tables/WaitersPage',
          },
          {
            id: 'pos-data-tables-section-list',
            title: 'Tables Section List',
            icon: IconPlaceholder,
            href: '/react-tables/TableSectionListTable',
          },
          {
            id: 'pos-data-tables-list',
            title: 'tables List',
            icon: IconPlaceholder,
            href: '/react-tables/TableListTable',
          },
        ],
      },
    ],
  },
];

export default Menuitems;
