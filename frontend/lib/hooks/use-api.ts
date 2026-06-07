"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { api, invoiceApi, feedbackApi, aiApi } from "@/lib/api";
import type { FeedbackData } from "@/lib/api";
import { CreateInvoiceRequest, InvoiceStatus, UpdateInvoiceRequest } from "@/lib/types";

export function useAuthenticatedApi() {
  const { accessToken } = useAuth();

  useEffect(() => {
    api.setTokenProvider(() => accessToken);
  }, [accessToken]);

  return useMemo(() => ({
    getDashboardStats: () => invoiceApi.getDashboardStats(),
    createInvoice: (data: CreateInvoiceRequest, sendEmail?: boolean) => invoiceApi.create(data, sendEmail),
    getAllInvoices: (status?: InvoiceStatus, page?: number, size?: number) =>
      invoiceApi.getAll(status, page, size),
    getInvoiceById: (id: number) => invoiceApi.getById(id),
    updateInvoice: (id: number, data: UpdateInvoiceRequest, resend?: boolean) =>
      invoiceApi.update(id, data, resend),
    deleteInvoice: (id: number) => invoiceApi.delete(id),
    recordDownload: (id: number) => invoiceApi.recordDownload(id),
    downloadPdf: (data: CreateInvoiceRequest) => invoiceApi.downloadPdf(data),
    uploadLogo: (file: File) => invoiceApi.uploadLogo(file),
    submitFeedback: (data: FeedbackData) => feedbackApi.submit(data),
    checkFeedback: (invoiceId: number) => feedbackApi.check(invoiceId),
    getFeedbackCount: () => feedbackApi.getCount(),
    analyzeInvoice: (file: File) => aiApi.analyzeInvoice(file),
    getAiUsage: () => aiApi.getUsage(),
    saveAiTemplate: (data: { name: string; analysisJson: string; sampleImageUrl?: string | null }) =>
      aiApi.saveTemplate(data),
    getAiTemplates: () => aiApi.getTemplates(),
    mapTemplate: (analysisJson: string) => aiApi.mapTemplate(analysisJson),
  }), []);
}
