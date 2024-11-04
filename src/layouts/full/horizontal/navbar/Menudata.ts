import {
  IconHome,
  IconPoint,
  IconAppWindow,
} from '@tabler/icons-react';
import { uniqueId } from 'lodash';

const Menuitems = [
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconHome,
    href: '/dashboards/',
    children: [
      {
        id: uniqueId(),
        title: 'Modern',
        icon: IconPoint,
        href: '/dashboards/modern',
        chip: 'New',
        chipColor: 'secondary',
      },
      {
        id: uniqueId(),
        title: 'eCommerce',
        icon: IconPoint,
        href: '/dashboards/ecommerce',
      },
    ],
  },
  {
    id: uniqueId(),
    title: 'Main data',
    icon: IconAppWindow,
    href: '#',
    children: [
      {
        id: uniqueId(),
        title: 'Users',
        icon: IconPoint,
        href: '/react-tables/column-visiblity',
      },
    ],
  },
 
];
export default Menuitems;
