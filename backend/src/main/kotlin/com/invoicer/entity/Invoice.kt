package com.invoicer.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "invoices")
data class Invoice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    // Company Info
    @Column(nullable = false)
    val companyName: String,

    val companyLogo: String? = null,

    @Column(nullable = false)
    val address: String,

    @Column(nullable = false)
    val city: String,

    @Column(nullable = false)
    val zipCode: String,

    @Column(nullable = false)
    val country: String,

    @Column(nullable = false)
    val phone: String,

    @Column(nullable = false)
    val companyEmail: String,

    // Invoice Details
    @Column(unique = true, nullable = false)
    val invoiceNumber: String,

    @Column(nullable = false)
    val invoiceDate: LocalDate,

    @Column(nullable = false)
    val dueDate: LocalDate,

    // Design
    @Column(nullable = false)
    val primaryColor: String = "#9747E6",

    @Column(nullable = false)
    val fontFamily: String = "Inter",

    // Email
    @Column(nullable = false)
    val clientEmail: String,

    val emailSubject: String? = null,

    @Column(length = 2000)
    val emailMessage: String? = null,

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
    val totalAmount: BigDecimal = BigDecimal.ZERO,

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: InvoiceStatus = InvoiceStatus.DRAFT,

    // Audit
    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class InvoiceStatus {
    DRAFT,
    SENT,
    PAID,
    CANCELLED
}
