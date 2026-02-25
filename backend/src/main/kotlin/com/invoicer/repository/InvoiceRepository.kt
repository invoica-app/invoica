package com.invoicer.repository

import com.invoicer.entity.Invoice
import com.invoicer.entity.InvoiceStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Repository
interface InvoiceRepository : JpaRepository<Invoice, Long> {
    fun findByInvoiceNumber(invoiceNumber: String): Invoice?

    fun findByStatus(status: InvoiceStatus): List<Invoice>

    fun findByClientEmail(clientEmail: String): List<Invoice>

    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :date AND i.status != 'PAID'")
    fun findOverdueInvoices(date: LocalDate = LocalDate.now()): List<Invoice>

    fun existsByInvoiceNumber(invoiceNumber: String): Boolean

    fun existsByInvoiceNumberAndUserId(invoiceNumber: String, userId: Long): Boolean

    fun findByUserId(userId: Long): List<Invoice>

    fun findByUserIdAndStatus(userId: Long, status: InvoiceStatus): List<Invoice>

    fun countByStatus(status: InvoiceStatus): Long

    fun countByUserId(userId: Long): Long

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.userId = :userId")
    fun sumRevenueByUserId(userId: Long): BigDecimal

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = 'PAID'")
    fun sumPaidRevenue(): BigDecimal

    fun findByStatus(status: InvoiceStatus, pageable: Pageable): Page<Invoice>

    @Query(
        "SELECT i FROM Invoice i WHERE " +
        "LOWER(i.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(i.clientEmail) LIKE LOWER(CONCAT('%', :search, '%'))"
    )
    fun searchByText(search: String, pageable: Pageable): Page<Invoice>

    @Query(
        "SELECT i FROM Invoice i WHERE " +
        "i.status = :status AND (" +
        "LOWER(i.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
        "LOWER(i.clientEmail) LIKE LOWER(CONCAT('%', :search, '%')))"
    )
    fun searchByStatusAndText(status: InvoiceStatus, search: String, pageable: Pageable): Page<Invoice>

    @Query("SELECT FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM') AS month, COUNT(i) FROM Invoice i WHERE i.createdAt >= :since GROUP BY FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM') ORDER BY month")
    fun countInvoicesByMonth(since: LocalDateTime): List<Array<Any>>

    @Query("SELECT FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM') AS month, COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.createdAt >= :since GROUP BY FUNCTION('TO_CHAR', i.createdAt, 'YYYY-MM') ORDER BY month")
    fun sumRevenueByMonth(since: LocalDateTime): List<Array<Any>>
}
