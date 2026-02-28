package com.invoicer.repository

import com.invoicer.entity.Feedback
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface FeedbackRepository : JpaRepository<Feedback, Long> {
    fun existsByUserIdAndInvoiceId(userId: Long, invoiceId: Long): Boolean
    fun countByUserId(userId: Long): Long
    fun countByUserIdAndCreatedAtAfter(userId: Long, since: LocalDateTime): Long

    fun findByType(type: String, pageable: Pageable): Page<Feedback>
    fun findByCategory(category: String, pageable: Pageable): Page<Feedback>

    @Query("SELECT COALESCE(AVG(f.rating), 0) FROM Feedback f WHERE f.rating IS NOT NULL")
    fun averageRating(): Double

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.npsScore >= 9")
    fun countPromoters(): Long

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.npsScore IS NOT NULL AND f.npsScore <= 6")
    fun countDetractors(): Long

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.npsScore IS NOT NULL")
    fun countNpsResponses(): Long

    @Query("SELECT f.category, COUNT(f) FROM Feedback f WHERE f.category IS NOT NULL GROUP BY f.category")
    fun countByCategory(): List<Array<Any>>
}
