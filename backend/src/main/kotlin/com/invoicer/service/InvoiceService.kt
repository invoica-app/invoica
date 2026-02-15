package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.Invoice
import com.invoicer.entity.InvoiceStatus
import com.invoicer.entity.LineItem
import com.invoicer.exception.InvoiceAccessDeniedException
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

    fun createInvoice(request: CreateInvoiceRequest, userId: Long): InvoiceResponse {
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
            clientName = request.clientName,
            clientCompany = request.clientCompany,
            clientAddress = request.clientAddress,
            clientCity = request.clientCity,
            clientZip = request.clientZip,
            clientCountry = request.clientCountry,
            taxRate = request.taxRate,
            discount = request.discount,
            notes = request.notes,
            clientEmail = request.clientEmail,
            emailSubject = request.emailSubject,
            emailMessage = request.emailMessage,
            userId = userId
        )

        // Add line items and calculate total
        var subtotal = BigDecimal.ZERO
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
            subtotal = subtotal.add(amount)
        }

        // Apply discount and tax to get the real total
        val discountAmount = request.discount?.let { BigDecimal.valueOf(it) } ?: BigDecimal.ZERO
        val taxableAmount = subtotal.subtract(discountAmount)
        val taxAmount = request.taxRate?.let { taxableAmount.multiply(BigDecimal.valueOf(it)).divide(BigDecimal(100)) } ?: BigDecimal.ZERO
        val total = subtotal.subtract(discountAmount).add(taxAmount)

        // Save with calculated total
        val savedInvoice = invoiceRepository.save(
            invoice.copy(totalAmount = total)
        )

        return savedInvoice.toResponse()
    }

    fun getInvoice(id: Long, userId: Long): InvoiceResponse {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        verifyOwnership(invoice, userId)
        return invoice.toResponse()
    }

    fun getAllInvoices(userId: Long): List<InvoiceResponse> {
        return invoiceRepository.findByUserId(userId).map { it.toResponse() }
    }

    fun updateInvoice(id: Long, request: UpdateInvoiceRequest, userId: Long): InvoiceResponse {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        verifyOwnership(invoice, userId)

        // Check for duplicate invoice number if changed
        if (request.invoiceNumber != null &&
            request.invoiceNumber != invoice.invoiceNumber &&
            invoiceRepository.existsByInvoiceNumber(request.invoiceNumber)
        ) {
            throw DuplicateInvoiceNumberException("Invoice number ${request.invoiceNumber} already exists")
        }

        // Update fields — compute subtotal from existing line items
        var subtotal = invoice.lineItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.amount) }
        val updatedLineItems = invoice.lineItems.toMutableList()

        // Update line items if provided
        if (request.lineItems != null) {
            updatedLineItems.clear()
            subtotal = BigDecimal.ZERO

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
                subtotal = subtotal.add(amount)
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
            clientName = request.clientName ?: invoice.clientName,
            clientCompany = request.clientCompany ?: invoice.clientCompany,
            clientAddress = request.clientAddress ?: invoice.clientAddress,
            clientCity = request.clientCity ?: invoice.clientCity,
            clientZip = request.clientZip ?: invoice.clientZip,
            clientCountry = request.clientCountry ?: invoice.clientCountry,
            taxRate = request.taxRate ?: invoice.taxRate,
            discount = request.discount ?: invoice.discount,
            notes = request.notes ?: invoice.notes,
            clientEmail = request.clientEmail ?: invoice.clientEmail,
            emailSubject = request.emailSubject ?: invoice.emailSubject,
            emailMessage = request.emailMessage ?: invoice.emailMessage,
            status = request.status ?: invoice.status,
            lineItems = updatedLineItems,
            updatedAt = LocalDateTime.now()
        )

        // Recalculate total with discount and tax
        val resolvedDiscount = updatedInvoice.discount?.let { BigDecimal.valueOf(it) } ?: BigDecimal.ZERO
        val taxableAmount = subtotal.subtract(resolvedDiscount)
        val resolvedTax = updatedInvoice.taxRate?.let { taxableAmount.multiply(BigDecimal.valueOf(it)).divide(BigDecimal(100)) } ?: BigDecimal.ZERO
        val totalAmount = subtotal.subtract(resolvedDiscount).add(resolvedTax)

        return invoiceRepository.save(updatedInvoice.copy(totalAmount = totalAmount)).toResponse()
    }

    fun deleteInvoice(id: Long, userId: Long) {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        verifyOwnership(invoice, userId)
        invoiceRepository.deleteById(id)
    }

    fun getInvoicesByStatus(status: InvoiceStatus, userId: Long): List<InvoiceResponse> {
        return invoiceRepository.findByUserIdAndStatus(userId, status).map { it.toResponse() }
    }

    private fun verifyOwnership(invoice: Invoice, userId: Long) {
        if (invoice.userId != null && invoice.userId != userId) {
            throw InvoiceAccessDeniedException("You do not have access to this invoice")
        }
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
        clientName = clientName,
        clientCompany = clientCompany,
        clientAddress = clientAddress,
        clientCity = clientCity,
        clientZip = clientZip,
        clientCountry = clientCountry,
        taxRate = taxRate,
        discount = discount,
        notes = notes,
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
