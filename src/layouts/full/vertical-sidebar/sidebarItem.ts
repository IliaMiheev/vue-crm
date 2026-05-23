import {
  DashboardIcon,
  Stack3Icon,
  UsersIcon,
  TruckDeliveryIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Главная' },
  {
    title: 'Дашборд',
    icon: DashboardIcon,
    to: '/dashboard'
  },
  {
    title: 'Клиенты',
    icon: UsersIcon,
    to: '/customer'
  },
  {
    title: 'Товары',
    icon: Stack3Icon,
    to: '/product'
  },
  {
    title: 'Заказы',
    icon: TruckDeliveryIcon,
    to: '/order'
  }
];

export default sidebarItem;
