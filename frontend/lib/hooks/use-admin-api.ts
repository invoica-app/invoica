"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { adminApi } from "@/lib/admin-api";

export function useAdminApi() {
  const { accessToken } = useAuth();

  return useMemo(
    () => ({
      getDashboard: () => adminApi.getDashboard(accessToken),
      getUsers: (page: number, pageSize: number, search?: string) =>
        adminApi.getUsers(page, pageSize, search, accessToken),
      getUserById: (id: number) => adminApi.getUserById(id, accessToken),
      updateUserStatus: (id: number, disabled: boolean) =>
        adminApi.updateUserStatus(id, disabled, accessToken),
      getInvoices: (page: number, pageSize: number, status?: string, search?: string) =>
        adminApi.getInvoices(page, pageSize, status, search, accessToken),
      getInvoiceById: (id: number) => adminApi.getInvoiceById(id, accessToken),
      getHealth: () => adminApi.getHealth(accessToken),
    }),
    [accessToken]
  );
}
