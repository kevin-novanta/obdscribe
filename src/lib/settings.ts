// src/lib/settings.ts
import { prisma } from "@/lib/db";

export type ShopSettings = {
  displayName?: string | null;
  phone?: string | null;
  address?: string | null;
  defaultReportMode?: string | null;   // "standard" | "premium"
  defaultReportTone?: string | null;   // "plain_english" | "technical"
  defaultIncludeMaint?: boolean | null;
};

export type UserSettings = {
  displayName?: string | null;
};

export async function getShopSettings(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      displayName: true,
      phone: true,
      address: true,
      defaultReportMode: true,
      defaultReportTone: true,
      defaultIncludeMaint: true,
    } as any,
  });

  return shop;
}

export async function updateShopSettings(
  shopId: string,
  input: ShopSettings
) {
  const updated = await prisma.shop.update({
    where: { id: shopId },
    data: {
      displayName: input.displayName ?? undefined,
      phone: input.phone ?? undefined,
      address: input.address ?? undefined,
      defaultReportMode: input.defaultReportMode ?? undefined,
      defaultReportTone: input.defaultReportTone ?? undefined,
      defaultIncludeMaint:
        typeof input.defaultIncludeMaint === "boolean"
          ? input.defaultIncludeMaint
          : undefined,
    },
  });

  return updated;
}

export async function getUserSettings(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  });

  return user;
}

export async function updateUserSettings(
  userId: string,
  input: UserSettings
) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      displayName: input.displayName ?? undefined,
    },
  });

  return updated;
}
