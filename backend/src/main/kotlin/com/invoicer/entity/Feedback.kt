package com.invoicer.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "feedback")
class Feedback(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id")
    val userId: Long = 0,

    @Column(nullable = false, length = 20)
    var type: String = "",

    @Column(length = 20)
    var category: String? = null,

    var rating: Int? = null,

    @Column(name = "nps_score")
    var npsScore: Int? = null,

    @Column(name = "ease_score")
    var easeScore: Int? = null,

    @Column(columnDefinition = "TEXT")
    var message: String? = null,

    @Column(name = "invoice_id")
    var invoiceId: Long? = null,

    @Column(length = 255)
    var page: String? = null,

    @Column(name = "user_agent", columnDefinition = "TEXT")
    var userAgent: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Feedback) return false
        return id != 0L && id == other.id
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
