"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { invoiceApi, feedbackApi, FeedbackData } from "@/lib/api";

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
        data: Parameters<typeof invoiceApi.update>[1],
        resend?: boolean
      ) => invoiceApi.update(id, data, resend, accessToken),
      deleteInvoice: (id: number) => invoiceApi.delete(id, accessToken),
      uploadLogo: (file: File) => invoiceApi.uploadLogo(file, accessToken),
      submitFeedback: (data: FeedbackData) => feedbackApi.submit(data, accessToken),
      checkFeedback: (invoiceId: number) => feedbackApi.check(invoiceId, accessToken),
      getFeedbackCount: () => feedbackApi.getCount(accessToken),
    }),
    [accessToken]
  );
}
