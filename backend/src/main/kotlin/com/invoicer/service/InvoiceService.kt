package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.Invoice
import com.invoicer.entity.InvoiceStatus
import com.invoicer.entity.LineItem
import com.invoicer.exception.InvoiceAccessDeniedException
import com.invoicer.exception.InvoiceNotFoundException
import com.invoicer.exception.DuplicateInvoiceNumberException
import com.invoicer.repository.InvoiceRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime

@Service
@Transactional
class InvoiceService(
    private val invoiceRepository: InvoiceRepository,
    private val emailService: EmailService
) {
    private val logger = LoggerFactory.getLogger(InvoiceService::class.java)

    fun createInvoice(request: CreateInvoiceRequest, userId: Long): InvoiceResponse {
        if (invoiceRepository.existsByInvoiceNumberAndUserId(request.invoiceNumber, userId)) {
            throw DuplicateInvoiceNumberException("Invoice number ${request.invoiceNumber} already exists")
        }

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
            currency = request.currency,
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

        invoice.totalAmount = calculateTotal(subtotal, request.discount, request.taxRate)

        val savedInvoice = invoiceRepository.save(invoice)

        try {
            emailService.sendInvoiceEmail(savedInvoice)
            savedInvoice.status = InvoiceStatus.SENT
            savedInvoice.updatedAt = LocalDateTime.now()
            invoiceRepository.save(savedInvoice)
        } catch (e: Exception) {
            logger.warn("Failed to send invoice email for ${savedInvoice.invoiceNumber}, invoice saved as DRAFT", e)
        }

        return savedInvoice.toResponse()
    }

    @Transactional(readOnly = true)
    fun getInvoice(id: Long, userId: Long): InvoiceResponse {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        verifyOwnership(invoice, userId)
        return invoice.toResponse()
    }

    @Transactional(readOnly = true)
    fun getAllInvoices(userId: Long): List<InvoiceResponse> {
        return invoiceRepository.findByUserId(userId).map { it.toResponse() }
    }

    fun updateInvoice(id: Long, request: UpdateInvoiceRequest, userId: Long): InvoiceResponse {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        verifyOwnership(invoice, userId)

        if (request.invoiceNumber != null &&
            request.invoiceNumber != invoice.invoiceNumber &&
            invoiceRepository.existsByInvoiceNumberAndUserId(request.invoiceNumber, userId)
        ) {
            throw DuplicateInvoiceNumberException("Invoice number ${request.invoiceNumber} already exists")
        }

        // Update mutable fields
        request.companyName?.let { invoice.companyName = it }
        request.companyLogo?.let { invoice.companyLogo = it }
        request.address?.let { invoice.address = it }
        request.city?.let { invoice.city = it }
        request.zipCode?.let { invoice.zipCode = it }
        request.country?.let { invoice.country = it }
        request.phone?.let { invoice.phone = it }
        request.companyEmail?.let { invoice.companyEmail = it }
        request.invoiceNumber?.let { invoice.invoiceNumber = it }
        request.invoiceDate?.let { invoice.invoiceDate = it }
        request.dueDate?.let { invoice.dueDate = it }
        request.primaryColor?.let { invoice.primaryColor = it }
        request.fontFamily?.let { invoice.fontFamily = it }
        request.currency?.let { invoice.currency = it }
        request.clientName?.let { invoice.clientName = it }
        request.clientCompany?.let { invoice.clientCompany = it }
        request.clientAddress?.let { invoice.clientAddress = it }
        request.clientCity?.let { invoice.clientCity = it }
        request.clientZip?.let { invoice.clientZip = it }
        request.clientCountry?.let { invoice.clientCountry = it }
        request.taxRate?.let { invoice.taxRate = it }
        request.discount?.let { invoice.discount = it }
        request.notes?.let { invoice.notes = it }
        request.clientEmail?.let { invoice.clientEmail = it }
        request.emailSubject?.let { invoice.emailSubject = it }
        request.emailMessage?.let { invoice.emailMessage = it }
        request.status?.let { invoice.status = it }
        invoice.updatedAt = LocalDateTime.now()

        // Update line items if provided
        if (request.lineItems != null) {
            invoice.lineItems.clear()
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
            }
        }

        // Recalculate total from current line items
        val subtotal = invoice.lineItems.fold(BigDecimal.ZERO) { acc, item -> acc.add(item.amount) }
        invoice.totalAmount = calculateTotal(subtotal, invoice.discount, invoice.taxRate)

        return invoiceRepository.save(invoice).toResponse()
    }

    fun deleteInvoice(id: Long, userId: Long) {
        val invoice = invoiceRepository.findById(id)
            .orElseThrow { InvoiceNotFoundException("Invoice not found with id: $id") }
        verifyOwnership(invoice, userId)
        invoiceRepository.deleteById(id)
    }

    @Transactional(readOnly = true)
    fun getInvoicesByStatus(status: InvoiceStatus, userId: Long): List<InvoiceResponse> {
        return invoiceRepository.findByUserIdAndStatus(userId, status).map { it.toResponse() }
    }

    private fun verifyOwnership(invoice: Invoice, userId: Long) {
        if (invoice.userId != userId) {
            throw InvoiceAccessDeniedException("You do not have access to this invoice")
        }
    }

    private fun calculateTotal(subtotal: BigDecimal, discount: Double?, taxRate: Double?): BigDecimal {
        val discountAmount = discount?.let { BigDecimal.valueOf(it) } ?: BigDecimal.ZERO
        val taxableAmount = subtotal.subtract(discountAmount)
        val taxAmount = taxRate?.let {
            taxableAmount.multiply(BigDecimal.valueOf(it)).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        } ?: BigDecimal.ZERO
        return subtotal.subtract(discountAmount).add(taxAmount)
    }

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
        currency = currency,
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
