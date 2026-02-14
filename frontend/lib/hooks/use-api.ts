"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { invoiceApi } from "@/lib/api";

export function useAuthenticatedApi() {
  const { accessToken } = useAuth();

  return useMemo(
    () => ({
      createInvoice: (data: Parameters<typeof invoiceApi.create>[0]) =>
        invoiceApi.create(data, accessToken),
      getAllInvoices: (status?: Parameters<typeof invoiceApi.getAll>[0]) =>
        invoiceApi.getAll(status, accessToken),
      getInvoiceById: (id: number) => invoiceApi.getById(id, accessToken),
      updateInvoice: (
        id: number,
        data: Parameters<typeof invoiceApi.update>[1]
      ) => invoiceApi.update(id, data, accessToken),
      deleteInvoice: (id: number) => invoiceApi.delete(id, accessToken),
      uploadLogo: (file: File) => invoiceApi.uploadLogo(file, accessToken),
    }),
    [accessToken]
  );
}
