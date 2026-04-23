import {
  CircleIcon,
  WindmillIcon,
  TypographyIcon,
  ShadowIcon,
  PaletteIcon,
  KeyIcon,
  BugIcon,
  DashboardIcon,
  BrandChromeIcon,
Stack3Icon,
  UsersIcon,
  HelpIcon,
  TruckDeliveryIcon,
  ArticleIcon,
  TemplateIcon,
  UserDollarIcon
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
  },
  // { divider: true },
  // { header: 'Маркетинг' }
  // ,
  // {
  //   title: 'Блог',
  //   icon: TemplateIcon,
  //   to: '/blog'
  // },
  
  // { divider: true },
  // { header: 'Utilities' },
  // {
  //   title: 'Typography',
  //   icon: TypographyIcon,
  //   to: '/utils/typography'
  // },
  // {
  //   title: 'Shadows',
  //   icon: ShadowIcon,
  //   to: '/utils/shadows'
  // },
  // {
  //   title: 'Colors',
  //   icon: PaletteIcon,
  //   to: '/utils/colors'
  // },

  // {
  //   title: 'Icons',
  //   icon: WindmillIcon,
  //   to: '/forms/radio',
  //   children: [
  //     {
  //       title: 'Tabler Icons',
  //       icon: CircleIcon,
  //       to: '/icons/tabler'
  //     },
  //     {
  //       title: 'Material Icons',
  //       icon: CircleIcon,
  //       to: '/icons/material'
  //     }
  //   ]
  // }
];

export default sidebarItem;
