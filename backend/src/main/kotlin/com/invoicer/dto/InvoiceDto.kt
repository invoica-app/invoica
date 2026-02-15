package com.invoicer.dto

import com.invoicer.entity.InvoiceStatus
import jakarta.validation.Valid
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class CreateInvoiceRequest(
    // Company Info
    @field:NotBlank(message = "Company name is required")
    val companyName: String,

    val companyLogo: String? = null,

    @field:NotBlank(message = "Address is required")
    val address: String,

    @field:NotBlank(message = "City is required")
    val city: String,

    @field:NotBlank(message = "Zip code is required")
    val zipCode: String,

    @field:NotBlank(message = "Country is required")
    val country: String,

    @field:NotBlank(message = "Phone is required")
    val phone: String,

    @field:NotBlank(message = "Company email is required")
    @field:Email(message = "Invalid company email")
    val companyEmail: String,

    // Invoice Details
    @field:NotBlank(message = "Invoice number is required")
    val invoiceNumber: String,

    @field:NotNull(message = "Invoice date is required")
    val invoiceDate: LocalDate,

    @field:NotNull(message = "Due date is required")
    val dueDate: LocalDate,

    // Design
    val primaryColor: String = "#9747E6",
    val fontFamily: String = "Inter",

    // Client (Bill To)
    val clientName: String? = null,
    val clientCompany: String? = null,
    val clientAddress: String? = null,
    val clientCity: String? = null,
    val clientZip: String? = null,
    val clientCountry: String? = null,

    // Tax, Discount, Notes
    @field:Min(value = 0, message = "Tax rate cannot be negative")
    @field:Max(value = 100, message = "Tax rate cannot exceed 100%")
    val taxRate: Double? = null,

    @field:DecimalMin(value = "0.0", message = "Discount cannot be negative")
    val discount: Double? = null,

    val notes: String? = null,

    // Email
    @field:NotBlank(message = "Client email is required")
    @field:Email(message = "Invalid client email")
    val clientEmail: String,

    val emailSubject: String? = null,
    val emailMessage: String? = null,

    // Line Items
    @field:Valid
    @field:NotNull(message = "Line items are required")
    val lineItems: List<LineItemRequest>
)

data class UpdateInvoiceRequest(
    val companyName: String? = null,
    val companyLogo: String? = null,
    val address: String? = null,
    val city: String? = null,
    val zipCode: String? = null,
    val country: String? = null,
    val phone: String? = null,
    @field:Email(message = "Invalid company email")
    val companyEmail: String? = null,
    val invoiceNumber: String? = null,
    val invoiceDate: LocalDate? = null,
    val dueDate: LocalDate? = null,
    val primaryColor: String? = null,
    val fontFamily: String? = null,
    // Client (Bill To)
    val clientName: String? = null,
    val clientCompany: String? = null,
    val clientAddress: String? = null,
    val clientCity: String? = null,
    val clientZip: String? = null,
    val clientCountry: String? = null,
    // Tax, Discount, Notes
    @field:Min(value = 0, message = "Tax rate cannot be negative")
    @field:Max(value = 100, message = "Tax rate cannot exceed 100%")
    val taxRate: Double? = null,

    @field:DecimalMin(value = "0.0", message = "Discount cannot be negative")
    val discount: Double? = null,

    val notes: String? = null,
    @field:Email(message = "Invalid client email")
    val clientEmail: String? = null,
    val emailSubject: String? = null,
    val emailMessage: String? = null,
    val lineItems: List<LineItemRequest>? = null,
    val status: InvoiceStatus? = null
)

data class LineItemRequest(
    @field:NotBlank(message = "Description is required")
    val description: String,

    @field:NotNull(message = "Quantity is required")
    @field:Positive(message = "Quantity must be positive")
    val quantity: Int,

    @field:NotNull(message = "Rate is required")
    @field:DecimalMin(value = "0.0", inclusive = true, message = "Rate cannot be negative")
    val rate: BigDecimal
)

data class InvoiceResponse(
    val id: Long,
    val companyName: String,
    val companyLogo: String?,
    val address: String,
    val city: String,
    val zipCode: String,
    val country: String,
    val phone: String,
    val companyEmail: String,
    val invoiceNumber: String,
    val invoiceDate: LocalDate,
    val dueDate: LocalDate,
    val primaryColor: String,
    val fontFamily: String,
    // Client (Bill To)
    val clientName: String?,
    val clientCompany: String?,
    val clientAddress: String?,
    val clientCity: String?,
    val clientZip: String?,
    val clientCountry: String?,
    // Tax, Discount, Notes
    val taxRate: Double?,
    val discount: Double?,
    val notes: String?,
    val clientEmail: String,
    val emailSubject: String?,
    val emailMessage: String?,
    val lineItems: List<LineItemResponse>,
    val totalAmount: BigDecimal,
    val status: InvoiceStatus,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class LineItemResponse(
    val id: Long,
    val description: String,
    val quantity: Int,
    val rate: BigDecimal,
    val amount: BigDecimal
)
