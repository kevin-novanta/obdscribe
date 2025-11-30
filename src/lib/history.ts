

// src/lib/history.ts
//
// Helpers for querying and fetching report history for a given shop/user.
// Keeping this logic in one place makes it easier to evolve later
// (filters, search, pagination, etc.).

import { prisma } from "@/lib/db";

/**
 * Return the most recent reports for a given shop.
 * Optionally filter by userId if you want per-user history.
 *
 * For v0 we cap this at 100 to keep things fast and simple.
 */
export async function listRecentReportsForShop(
  shopId: string,
  userId?: string
) {
  return prisma.report.findMany({
    where: userId
      ? { shopId, userId }
      : { shopId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

/**
 * Fetch a single report by id, scoped to a shop.
 * This ensures a user cannot access another shop's reports.
 */
export async function getReportByIdForShop(shopId: string, id: string) {
  return prisma.report.findFirst({
    where: {
      id,
      shopId,
    },
  });
}