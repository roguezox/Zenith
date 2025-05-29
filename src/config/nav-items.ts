import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Tags, FileText, Goal, Settings } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  tooltip?: string;
}

export const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    tooltip: 'Dashboard',
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: FileText,
    tooltip: 'Track Expenses',
  },
  {
    href: '/categories',
    label: 'Categories',
    icon: Tags,
    tooltip: 'Manage Categories',
  },
  {
    href: '/goals',
    label: 'Goals',
    icon: Goal,
    tooltip: 'Set Budget Goals',
  },
];

export const bottomNavItems: NavItem[] = [
    // Example for settings or other bottom items
    // {
    //   href: '/settings',
    //   label: 'Settings',
    //   icon: Settings,
    //   tooltip: 'Settings'
    // }
];
