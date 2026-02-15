package com.invoicer.repository

import com.invoicer.entity.Invoice
import com.invoicer.entity.InvoiceStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface InvoiceRepository : JpaRepository<Invoice, Long> {
    fun findByInvoiceNumber(invoiceNumber: String): Invoice?

    fun findByStatus(status: InvoiceStatus): List<Invoice>

    fun findByClientEmail(clientEmail: String): List<Invoice>

    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :date AND i.status != 'PAID'")
    fun findOverdueInvoices(date: LocalDate = LocalDate.now()): List<Invoice>

    fun existsByInvoiceNumber(invoiceNumber: String): Boolean

    fun findByUserId(userId: Long): List<Invoice>

    fun findByUserIdAndStatus(userId: Long, status: InvoiceStatus): List<Invoice>
}
