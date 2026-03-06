package com.invoicer.controller

import com.invoicer.dto.CreateInvoiceRequest
import com.invoicer.dto.InvoiceResponse
import com.invoicer.dto.PublicInvoiceResponse
import com.invoicer.dto.UpdateInvoiceRequest
import com.invoicer.dto.UserDashboardStatsResponse
import com.invoicer.entity.InvoiceStatus
import com.invoicer.service.InvoiceService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/invoices")
class InvoiceController(
    private val invoiceService: InvoiceService
) {

    @GetMapping("/public/{publicToken}")
    fun getPublicInvoice(@PathVariable publicToken: String): ResponseEntity<PublicInvoiceResponse> {
        val invoice = invoiceService.getPublicInvoice(publicToken)
        return ResponseEntity.ok(invoice)
    }

    @GetMapping("/dashboard-stats")
    fun getDashboardStats(authentication: Authentication): ResponseEntity<UserDashboardStatsResponse> {
        val userId = authentication.credentials as Long
        val stats = invoiceService.getDashboardStats(userId)
        return ResponseEntity.ok(stats)
    }

    @PostMapping
    fun createInvoice(
        @Valid @RequestBody request: CreateInvoiceRequest,
        authentication: Authentication
    ): ResponseEntity<InvoiceResponse> {
        val userId = authentication.credentials as Long
        val invoice = invoiceService.createInvoice(request, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice)
    }

    @GetMapping
    fun getAllInvoices(
        @RequestParam(required = false) status: InvoiceStatus?,
        authentication: Authentication
    ): ResponseEntity<List<InvoiceResponse>> {
        val userId = authentication.credentials as Long
        val invoices = if (status != null) {
            invoiceService.getInvoicesByStatus(status, userId)
        } else {
            invoiceService.getAllInvoices(userId)
        }
        return ResponseEntity.ok(invoices)
    }

    @GetMapping("/{id}")
    fun getInvoice(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<InvoiceResponse> {
        val userId = authentication.credentials as Long
        val invoice = invoiceService.getInvoice(id, userId)
        return ResponseEntity.ok(invoice)
    }

    @PutMapping("/{id}")
    fun updateInvoice(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateInvoiceRequest,
        @RequestParam(required = false, defaultValue = "false") resend: Boolean,
        authentication: Authentication
    ): ResponseEntity<InvoiceResponse> {
        val userId = authentication.credentials as Long
        val invoice = invoiceService.updateInvoice(id, request, userId, resend)
        return ResponseEntity.ok(invoice)
    }

    @PostMapping("/{id}/download")
    fun recordDownload(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.credentials as Long
        invoiceService.recordDownload(id, userId)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}")
    fun deleteInvoice(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = authentication.credentials as Long
        invoiceService.deleteInvoice(id, userId)
        return ResponseEntity.noContent().build()
    }
}
