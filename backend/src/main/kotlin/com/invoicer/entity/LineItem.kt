package com.invoicer.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "line_items")
data class LineItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    val description: String,

    @Column(nullable = false)
    val quantity: Int,

    @Column(nullable = false)
    val rate: BigDecimal,

    @Column(nullable = false)
    val amount: BigDecimal,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonIgnore
    val invoice: Invoice? = null
)
