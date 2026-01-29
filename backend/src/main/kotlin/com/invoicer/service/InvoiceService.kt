package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.Invoice
import com.invoicer.entity.InvoiceStatus
import com.invoicer.entity.LineItem
import com.invoicer.exception.InvoiceNotFoundException
import com.invoicer.exception.DuplicateInvoiceNumberException
import com.invoicer.repository.InvoiceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
@Transactional
class InvoiceService(
    private val invoiceRepository: InvoiceRepository
) {

    fun createInvoice(request: CreateInvoiceRequest): InvoiceResponse {
        // Check for duplicate invoice number
        if (invoiceRepository.existsByInvoiceNumber(request.invoiceNumber)) {
            throw DuplicateInvoiceNumberException("Invoice number ${request.invoiceNumber} already exists")
        }

        // Create invoice entity
        val invoice = Invoice(
            companyName = request.companyName,
            companyLogo = request.companyLogo,
            address = request.address,
            city = request.city,
            zipCode = request.zipCode,
            country = request.country,
            phone = request.phone,
            companyEmail = request.companyEmail,
            invoiceNumber = request.invoiceNumber,
            invoiceDate = request.invoiceDate,
            dueDate = request.dueDate,
            primaryColor = request.primaryColor,
            fontFamily = request.fontFamily,
            clientEmail = request.clientEmail,
            emailSubject = request.emailSubject,
            emailMessage = request.emailMessage
        )

        // Add line items and calculate total
        var total = BigDecimal.ZERO
        request.lineItems.forEach { itemRequest ->
            val amount = itemRequest.rate.multiply(BigDecimal(itemRequest.quantity))
            val lineItem = LineItem(
                description = itemRequest.description,
                quantity = itemRequest.quantity,
                rate = itemRequest.rate,
                amount = amount,
                invoice = invoice
            )
            invoice.lineItems.add(lineItem)
            total = total.add(amount)
        }

        // Save with calculated total
        val savedInvoice = invoiceRepository.save(
            invoice.copy(totalAmount = total)
        )

        return savedInvoice.toResponse()
    }

    fun getInvoice(id: Long): InvoiceResponse {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        return invoice.toResponse()
    }

    fun getAllInvoices(): List<InvoiceResponse> {
        return invoiceRepository.findAll().map { it.toResponse() }
    }

    fun updateInvoice(id: Long, request: UpdateInvoiceRequest): InvoiceResponse {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }

        // Check for duplicate invoice number if changed
        if (request.invoiceNumber != null &&
            request.invoiceNumber != invoice.invoiceNumber &&
            invoiceRepository.existsByInvoiceNumber(request.invoiceNumber)
        ) {
            throw DuplicateInvoiceNumberException("Invoice number ${request.invoiceNumber} already exists")
        }

        // Update fields
        var totalAmount = invoice.totalAmount
        val updatedLineItems = invoice.lineItems.toMutableList()

        // Update line items if provided
        if (request.lineItems != null) {
            updatedLineItems.clear()
            totalAmount = BigDecimal.ZERO

            request.lineItems.forEach { itemRequest ->
                val amount = itemRequest.rate.multiply(BigDecimal(itemRequest.quantity))
                val lineItem = LineItem(
                    description = itemRequest.description,
                    quantity = itemRequest.quantity,
                    rate = itemRequest.rate,
                    amount = amount,
                    invoice = invoice
                )
                updatedLineItems.add(lineItem)
                totalAmount = totalAmount.add(amount)
            }
        }

        val updatedInvoice = invoice.copy(
            companyName = request.companyName ?: invoice.companyName,
            companyLogo = request.companyLogo ?: invoice.companyLogo,
            address = request.address ?: invoice.address,
            city = request.city ?: invoice.city,
            zipCode = request.zipCode ?: invoice.zipCode,
            country = request.country ?: invoice.country,
            phone = request.phone ?: invoice.phone,
            companyEmail = request.companyEmail ?: invoice.companyEmail,
            invoiceNumber = request.invoiceNumber ?: invoice.invoiceNumber,
            invoiceDate = request.invoiceDate ?: invoice.invoiceDate,
            dueDate = request.dueDate ?: invoice.dueDate,
            primaryColor = request.primaryColor ?: invoice.primaryColor,
            fontFamily = request.fontFamily ?: invoice.fontFamily,
            clientEmail = request.clientEmail ?: invoice.clientEmail,
            emailSubject = request.emailSubject ?: invoice.emailSubject,
            emailMessage = request.emailMessage ?: invoice.emailMessage,
            status = request.status ?: invoice.status,
            totalAmount = totalAmount,
            lineItems = updatedLineItems,
            updatedAt = LocalDateTime.now()
        )

        return invoiceRepository.save(updatedInvoice).toResponse()
    }

    fun deleteInvoice(id: Long) {
        if (!invoiceRepository.existsById(id)) {
            throw InvoiceNotFoundException("Invoice not found with id: $id")
        }
        invoiceRepository.deleteById(id)
    }

    fun getInvoicesByStatus(status: InvoiceStatus): List<InvoiceResponse> {
        return invoiceRepository.findByStatus(status).map { it.toResponse() }
    }

    // Extension function to convert entity to response
    private fun Invoice.toResponse() = InvoiceResponse(
        id = id!!,
        companyName = companyName,
        companyLogo = companyLogo,
        address = address,
        city = city,
        zipCode = zipCode,
        country = country,
        phone = phone,
        companyEmail = companyEmail,
        invoiceNumber = invoiceNumber,
        invoiceDate = invoiceDate,
        dueDate = dueDate,
        primaryColor = primaryColor,
        fontFamily = fontFamily,
        clientEmail = clientEmail,
        emailSubject = emailSubject,
        emailMessage = emailMessage,
        lineItems = lineItems.map { it.toResponse() },
        totalAmount = totalAmount,
        status = status,
        createdAt = createdAt,
        updatedAt = updatedAt
    )

    private fun LineItem.toResponse() = LineItemResponse(
        id = id!!,
        description = description,
        quantity = quantity,
        rate = rate,
        amount = amount
    )
}
