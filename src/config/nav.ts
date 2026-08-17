import type { ComponentType } from "svelte";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  ShoppingCart,
  FileText,
  Bell,
  Shield,
  Database,
  Puzzle,
} from "@lucide/svelte";

export interface NavL3 {
  key: string;
  label: string;
  path: string;
  icon?: ComponentType;
}

export interface NavL2 {
  key: string;
  label: string;
  icon: ComponentType;
  children?: NavL3[];
  path?: string;
}

export interface NavGroup {
  groupKey: string;
  groupLabel: string;
  labelColor: string;
  items: NavL2[];
}

export const navGroups: NavGroup[] = [
  {
    groupKey: "overview",
    groupLabel: "核心概览",
    labelColor: "text-brand-400",
    items: [
      { key: "dashboard", label: "数据概览", icon: LayoutDashboard, path: "/dashboard" },
      { key: "analytics", label: "数据分析", icon: BarChart3, path: "/analytics" },
    ],
  },
  {
    groupKey: "business",
    groupLabel: "业务管理",
    labelColor: "text-acc-cyan",
    items: [
      {
        key: "orders",
        label: "订单管理",
        icon: ShoppingCart,
        children: [
          { key: "orders-list", label: "订单列表", path: "/orders/list", icon: ShoppingCart },
          { key: "orders-return", label: "退换货", path: "/orders/return", icon: FileText },
          { key: "orders-export", label: "导出报表", path: "/orders/export", icon: BarChart3 },
        ],
      },
      {
        key: "users",
        label: "用户管理",
        icon: Users,
        children: [
          { key: "users-list", label: "用户列表", path: "/users/list", icon: Users },
          { key: "users-role", label: "角色权限", path: "/users/roles", icon: Shield },
          { key: "users-log", label: "操作日志", path: "/users/logs", icon: Bell },
        ],
      },
      {
        key: "docs",
        label: "文档中心",
        icon: FileText,
        children: [
          { key: "docs-guide", label: "使用指南", path: "/docs/guide", icon: FileText },
          { key: "docs-api", label: "API 文档", path: "/docs/api", icon: Database },
          { key: "docs-changelog", label: "更新日志", path: "/docs/changelog", icon: Bell },
        ],
      },
    ],
  },
  {
    groupKey: "system",
    groupLabel: "系统配置",
    labelColor: "text-acc-violet",
    items: [
      { key: "notify", label: "通知中心", icon: Bell, path: "/notify" },
      { key: "security", label: "安全策略", icon: Shield, path: "/security" },
      {
        key: "database",
        label: "数据管理",
        icon: Database,
        children: [
          { key: "db-backup", label: "数据备份", path: "/database/backup", icon: Database },
          { key: "db-restore", label: "数据恢复", path: "/database/restore", icon: Shield },
        ],
      },
      { key: "settings", label: "系统设置", icon: Settings, path: "/settings" },
      {
        key: "plugins",
        label: "插件扩展",
        icon: Puzzle,
        children: [
          { key: "plugins-list", label: "已安装", path: "/plugins/installed", icon: Puzzle },
          { key: "plugins-market", label: "插件市场", path: "/plugins/market", icon: ShoppingCart },
        ],
      },
    ],
  },
];

export interface FlatNavItem {
  key: string;
  label: string;
  path: string;
  icon?: ComponentType;
  groupKey: string;
}

export const navItemsFlat: FlatNavItem[] = navGroups.flatMap((g) =>
  g.items.flatMap((item) => {
    if (item.children && item.children.length > 0) {
      return item.children.map((child) => ({
        key: child.key,
        label: child.label,
        path: child.path,
        icon: child.icon,
        groupKey: g.groupKey,
      }));
    }
    return [
      {
        key: item.key,
        label: item.label,
        path: item.path ?? `/${item.key}`,
        icon: item.icon,
        groupKey: g.groupKey,
      },
    ];
  }),
);

export function findActiveL2(pathname: string): NavL2 | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.children) {
        if (item.children.some((c) => pathname === c.path || pathname.startsWith(c.path + "/"))) {
          return item;
        }
      } else {
        const p = item.path ?? `/${item.key}`;
        if (pathname === p || pathname.startsWith(p + "/")) return item;
      }
    }
  }
  return null;
}

export function findBreadcrumb(pathname: string): { label: string; icon?: ComponentType }[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.children) {
        const child = item.children.find(
          (c) => pathname === c.path || pathname.startsWith(c.path + "/"),
        );
        if (child)
          return [
            { label: item.label, icon: item.icon },
            { label: child.label, icon: child.icon },
          ];
      } else {
        const p = item.path ?? `/${item.key}`;
        if (pathname === p || pathname.startsWith(p + "/"))
          return [{ label: item.label, icon: item.icon }];
      }
    }
  }
  return [{ label: "数据概览" }];
}
