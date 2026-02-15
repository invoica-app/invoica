package com.invoicer.dto

import com.invoicer.entity.AuthProvider
import com.invoicer.entity.InvoiceStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class DashboardStatsResponse(
    val totalUsers: Long,
    val totalInvoices: Long,
    val paidRevenue: BigDecimal,
    val activeUsers30d: Long,
    val invoicesByStatus: Map<String, Long>,
    val invoicesOverTime: List<TimeSeriesPoint>,
    val revenueOverTime: List<TimeSeriesPoint>
)

data class TimeSeriesPoint(
    val label: String,
    val value: Number
)

data class AdminUserResponse(
    val id: Long,
    val email: String,
    val name: String,
    val provider: AuthProvider,
    val isGuest: Boolean,
    val isDisabled: Boolean,
    val invoiceCount: Long,
    val totalRevenue: BigDecimal,
    val createdAt: LocalDateTime
)

data class AdminUserListResponse(
    val users: List<AdminUserResponse>,
    val total: Long,
    val page: Int,
    val pageSize: Int
)

data class AdminInvoiceResponse(
    val id: Long,
    val invoiceNumber: String,
    val companyName: String,
    val clientName: String?,
    val clientEmail: String,
    val totalAmount: BigDecimal,
    val status: InvoiceStatus,
    val ownerEmail: String?,
    val ownerName: String?,
    val invoiceDate: LocalDate,
    val createdAt: LocalDateTime
)

data class AdminInvoiceListResponse(
    val invoices: List<AdminInvoiceResponse>,
    val total: Long,
    val page: Int,
    val pageSize: Int
)

data class SystemHealthResponse(
    val apiStatus: String,
    val databaseStatus: String,
    val uptime: Long,
    val jvmMemoryUsed: Long,
    val jvmMemoryMax: Long,
    val jvmMemoryPercent: Int
)

data class UpdateUserStatusRequest(
    val disabled: Boolean
)
