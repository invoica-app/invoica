package com.invoicer.controller

import com.invoicer.dto.CreateInvoiceRequest
import com.invoicer.service.EmailService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/invoices")
class PdfController(
    private val emailService: EmailService
) {

    @PostMapping("/pdf-preview")
    fun previewPdf(
        @RequestBody request: CreateInvoiceRequest,
        authentication: Authentication
    ): ResponseEntity<ByteArray> {
        val pdfBytes = emailService.generatePdfFromRequest(request)
        val fileName = "Invoice-${request.invoiceNumber}.pdf"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$fileName\"")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(pdfBytes.size.toLong())
            .body(pdfBytes)
    }
}
