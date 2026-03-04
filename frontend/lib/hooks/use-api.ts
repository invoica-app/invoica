"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { invoiceApi, feedbackApi, aiApi, FeedbackData } from "@/lib/api";
import { CreateInvoiceRequest } from "@/lib/types";

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
      recordDownload: (id: number) => invoiceApi.recordDownload(id, accessToken),
      downloadPdf: (data: CreateInvoiceRequest) => invoiceApi.downloadPdf(data, accessToken),
      uploadLogo: (file: File) => invoiceApi.uploadLogo(file, accessToken),
      submitFeedback: (data: FeedbackData) => feedbackApi.submit(data, accessToken),
      checkFeedback: (invoiceId: number) => feedbackApi.check(invoiceId, accessToken),
      getFeedbackCount: () => feedbackApi.getCount(accessToken),
      // AI API
      analyzeInvoice: (file: File) => aiApi.analyzeInvoice(file, accessToken),
      getAiUsage: () => aiApi.getUsage(accessToken),
      saveAiTemplate: (data: { name: string; analysisJson: string; sampleImageUrl?: string | null }) =>
        aiApi.saveTemplate(data, accessToken),
      getAiTemplates: () => aiApi.getTemplates(accessToken),
    }),
    [accessToken]
  );
}
