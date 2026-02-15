package com.invoicer.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "line_items")
class LineItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    var description: String = "",

    @Column(nullable = false)
    var quantity: Int = 0,

    @Column(nullable = false)
    var rate: BigDecimal = BigDecimal.ZERO,

    @Column(nullable = false)
    var amount: BigDecimal = BigDecimal.ZERO,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonIgnore
    var invoice: Invoice? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is LineItem) return false
        return id != null && id == other.id
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
