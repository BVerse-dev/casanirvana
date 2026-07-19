import { MENU_ITEMS } from "@/assets/data/menu-items";
import type { MenuItemType } from "@/types/menu";

export const getMenuItems = (): MenuItemType[] => {
  return MENU_ITEMS;
};

export type MenuCapabilityContext = {
  role?: string | null;
  permissions?: string[];
  menuCapabilities?: string[];
};

const hasAny = (available: Set<string>, expected?: string[]) => {
  if (!expected || expected.length === 0) return true;
  return expected.some((value) => available.has(value));
};

const canSeeItem = (item: MenuItemType, context: MenuCapabilityContext) => {
  const roleSet = new Set([context.role || ""]);
  const permissionSet = new Set(context.permissions || []);
  const capabilitySet = new Set(context.menuCapabilities || []);

  if (!hasAny(roleSet, item.requiredAnyRole)) return false;
  if (!hasAny(permissionSet, item.requiredAnyPermission)) return false;
  if (item.capabilityKey && !capabilitySet.has(item.capabilityKey)) return false;
  return true;
};

const filterRecursive = (
  items: MenuItemType[],
  context: MenuCapabilityContext
): MenuItemType[] => {
  return items
    .map((item) => {
      if (item.isTitle) return item;
      if (!canSeeItem(item, context)) return null;

      if (!item.children || item.children.length === 0) {
        return item;
      }

      const children = filterRecursive(item.children, context).filter((child) => !child.isTitle);
      if (children.length === 0 && !item.url) return null;

      return {
        ...item,
        children,
      };
    })
    .filter((item): item is MenuItemType => item !== null);
};

const cleanOrphanTitles = (items: MenuItemType[]): MenuItemType[] => {
  const cleaned: MenuItemType[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item.isTitle) {
      cleaned.push(item);
      continue;
    }

    let hasSectionContent = false;
    for (let cursor = index + 1; cursor < items.length; cursor += 1) {
      if (items[cursor].isTitle) break;
      hasSectionContent = true;
      break;
    }

    if (hasSectionContent) {
      cleaned.push(item);
    }
  }

  return cleaned;
};

export const filterMenuItemsByCapabilities = (
  items: MenuItemType[],
  context: MenuCapabilityContext
): MenuItemType[] => {
  const filtered = filterRecursive(items, context);
  return cleanOrphanTitles(filtered);
};

export const findAllParent = (
  menuItems: MenuItemType[],
  menuItem: MenuItemType,
): string[] => {
  let parents: string[] = [];
  const parent = findMenuItem(menuItems, menuItem.parentKey);
  if (parent) {
    parents.push(parent.key);
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)];
    }
  }
  return parents;
};

export const getMenuItemFromURL = (
  items: MenuItemType | MenuItemType[],
  url: string,
): MenuItemType | undefined => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url);
      if (foundItem) {
        return foundItem;
      }
    }
  } else {
    if (items.url == url) return items;
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item;
      }
    }
  }
};

export const findMenuItem = (
  menuItems: MenuItemType[] | undefined,
  menuItemKey: MenuItemType["key"] | undefined,
): MenuItemType | null => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item;
      }
      const found = findMenuItem(item.children, menuItemKey);
      if (found) return found;
    }
  }
  return null;
};
