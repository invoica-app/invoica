package com.invoicer.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "invoices")
class Invoice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    // Company Info
    @Column(nullable = false)
    var companyName: String = "",

    var companyLogo: String? = null,

    @Column(nullable = false)
    var address: String = "",

    @Column(nullable = false)
    var city: String = "",

    @Column(nullable = false)
    var zipCode: String = "",

    @Column(nullable = false)
    var country: String = "",

    @Column(nullable = false)
    var phone: String = "",

    @Column(nullable = false)
    var companyEmail: String = "",

    // Invoice Details
    @Column(unique = true, nullable = false)
    var invoiceNumber: String = "",

    @Column(nullable = false)
    var invoiceDate: LocalDate = LocalDate.now(),

    @Column(nullable = false)
    var dueDate: LocalDate = LocalDate.now(),

    // Design
    @Column(nullable = false)
    var primaryColor: String = "#9747E6",

    @Column(nullable = false)
    var fontFamily: String = "Inter",

    // Currency
    @Column(nullable = false)
    var currency: String = "USD",

    // Client (Bill To)
    var clientName: String? = null,
    var clientCompany: String? = null,
    var clientAddress: String? = null,
    var clientCity: String? = null,
    var clientZip: String? = null,
    var clientCountry: String? = null,

    // Tax, Discount, Notes
    var taxRate: Double? = null,
    var discount: Double? = null,
    @Column(length = 2000)
    var notes: String? = null,

    // Email
    var clientEmail: String? = null,

    var emailSubject: String? = null,

    @Column(length = 2000)
    var emailMessage: String? = null,

    // Line Items
    @OneToMany(
        mappedBy = "invoice",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    val lineItems: MutableList<LineItem> = mutableListOf(),

    // Calculated
    @Column(nullable = false)
    var totalAmount: BigDecimal = BigDecimal.ZERO,

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: InvoiceStatus = InvoiceStatus.DRAFT,

    // Owner
    val userId: Long? = null,

    // Audit
    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Invoice) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = javaClass.hashCode()
}

enum class InvoiceStatus {
    DRAFT,
    SENT,
    PAID,
    CANCELLED
}
