package com.invoicer.controller

import com.invoicer.dto.CreateInvoiceRequest
import com.invoicer.dto.InvoiceResponse
import com.invoicer.dto.UpdateInvoiceRequest
import com.invoicer.entity.InvoiceStatus
import com.invoicer.service.InvoiceService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = ["http://localhost:3000"])
class InvoiceController(
    private val invoiceService: InvoiceService
) {

    @PostMapping
    fun createInvoice(
        @Valid @RequestBody request: CreateInvoiceRequest
    ): ResponseEntity<InvoiceResponse> {
        val invoice = invoiceService.createInvoice(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(invoice)
    }

    @GetMapping
    fun getAllInvoices(
        @RequestParam(required = false) status: InvoiceStatus?
    ): ResponseEntity<List<InvoiceResponse>> {
        val invoices = if (status != null) {
            invoiceService.getInvoicesByStatus(status)
        } else {
            invoiceService.getAllInvoices()
        }
        return ResponseEntity.ok(invoices)
    }

    @GetMapping("/{id}")
    fun getInvoice(@PathVariable id: Long): ResponseEntity<InvoiceResponse> {
        val invoice = invoiceService.getInvoice(id)
        return ResponseEntity.ok(invoice)
    }

    @PutMapping("/{id}")
    fun updateInvoice(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateInvoiceRequest
    ): ResponseEntity<InvoiceResponse> {
        val invoice = invoiceService.updateInvoice(id, request)
        return ResponseEntity.ok(invoice)
    }

    @DeleteMapping("/{id}")
    fun deleteInvoice(@PathVariable id: Long): ResponseEntity<Void> {
        invoiceService.deleteInvoice(id)
        return ResponseEntity.noContent().build()
    }
}
