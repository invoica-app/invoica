package com.invoicer.controller

import com.invoicer.dto.CreateInvoiceRequest
import com.invoicer.dto.LineItemRequest
import com.invoicer.service.InvoicePdfService
import com.invoicer.service.InvoiceService
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/invoices")
class PdfController(
    private val pdfService: InvoicePdfService,
    private val invoiceService: InvoiceService
) {

    @PostMapping("/pdf-preview")
    fun previewPdf(
        @RequestBody request: CreateInvoiceRequest,
        authentication: Authentication
    ): ResponseEntity<ByteArray> {
        val pdfBytes = pdfService.generatePdf(request)
        val fileName = "Invoice-${request.invoiceNumber}.pdf"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$fileName\"")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(pdfBytes.size.toLong())
            .body(pdfBytes)
    }

    @GetMapping("/public/{publicToken}/pdf")
    fun downloadPublicPdf(@PathVariable publicToken: String): ResponseEntity<ByteArray> {
        val invoice = invoiceService.getPublicInvoice(publicToken)
        val request = CreateInvoiceRequest(
            companyName = invoice.companyName,
            companyLogo = invoice.companyLogo,
            address = invoice.address,
            city = invoice.city,
            zipCode = invoice.zipCode,
            country = invoice.country,
            phone = invoice.phone,
            companyEmail = invoice.companyEmail,
            invoiceNumber = invoice.invoiceNumber,
            invoiceDate = invoice.invoiceDate,
            dueDate = invoice.dueDate,
            primaryColor = invoice.primaryColor,
            fontFamily = invoice.fontFamily,
            templateId = invoice.templateId,
            authorizedSignature = invoice.authorizedSignature,
            currency = invoice.currency,
            clientName = invoice.clientName,
            clientCompany = invoice.clientCompany,
            clientAddress = invoice.clientAddress,
            clientCity = invoice.clientCity,
            clientZip = invoice.clientZip,
            clientCountry = invoice.clientCountry,
            clientPhone = invoice.clientPhone,
            taxRate = invoice.taxRate,
            discount = invoice.discount,
            notes = invoice.notes,
            clientEmail = invoice.clientEmail ?: "",
            lineItems = invoice.lineItems.map { item ->
                LineItemRequest(
                    description = item.description,
                    quantity = item.quantity,
                    rate = item.rate
                )
            }
        )
        val pdfBytes = pdfService.generatePdf(request)
        val fileName = "Invoice-${invoice.invoiceNumber}.pdf"

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$fileName\"")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(pdfBytes.size.toLong())
            .body(pdfBytes)
    }
}
