// src/lib/history.ts
//
// Helpers for querying and fetching report history for a given shop/user.
// Now extended with flexible filtering for history search.

import { prisma } from "@/lib/db";

export type HistoryFilterOptions = {
  make?: string;
  model?: string;
  code?: string;
  q?: string; // complaint search
  from?: Date;
  to?: Date;
};

export async function listRecentReportsForShop(
  shopId: string,
  userId?: string,
  filters?: HistoryFilterOptions
) {
  const where: any = {
    shopId,
  };

  if (userId) {
    where.userId = userId;
  }

  if (filters?.make) {
    where.vehicleMake = filters.make;
  }

  if (filters?.model) {
    where.vehicleModel = filters.model;
  }

  if (filters?.code) {
    where.codesRaw = {
      contains: filters.code,
      mode: "insensitive",
    };
  }

  if (filters?.q) {
    where.complaint = {
      contains: filters.q,
      mode: "insensitive",
    };
  }

  if (filters?.from || filters?.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  return prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getReportByIdForShop(shopId: string, id: string) {
  return prisma.report.findFirst({
    where: {
      id,
      shopId,
    },
  });
}