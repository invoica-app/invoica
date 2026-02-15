package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.InvoiceStatus
import com.invoicer.exception.AdminAccessDeniedException
import com.invoicer.repository.InvoiceRepository
import com.invoicer.repository.UserRepository
import com.invoicer.security.AdminService
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.management.ManagementFactory
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class AdminDashboardService(
    private val userRepository: UserRepository,
    private val invoiceRepository: InvoiceRepository,
    private val adminService: AdminService
) {

    private fun requireAdmin(email: String) {
        if (!adminService.isAdmin(email)) {
            throw AdminAccessDeniedException("Admin access required")
        }
    }

    fun getDashboardStats(email: String): DashboardStatsResponse {
        requireAdmin(email)

        val totalUsers = userRepository.count()
        val totalInvoices = invoiceRepository.count()
        val paidRevenue = invoiceRepository.sumPaidRevenue()
        val activeUsers30d = userRepository.countActiveUsersSince(LocalDateTime.now().minusDays(30))

        val invoicesByStatus = InvoiceStatus.entries.associate { status ->
            status.name to invoiceRepository.countByStatus(status)
        }

        val since = LocalDateTime.now().minusMonths(6)
        val invoicesOverTime = invoiceRepository.countInvoicesByMonth(since).map { row ->
            TimeSeriesPoint(label = row[0] as String, value = row[1] as Long)
        }
        val revenueOverTime = invoiceRepository.sumRevenueByMonth(since).map { row ->
            TimeSeriesPoint(label = row[0] as String, value = row[1] as BigDecimal)
        }

        return DashboardStatsResponse(
            totalUsers = totalUsers,
            totalInvoices = totalInvoices,
            paidRevenue = paidRevenue,
            activeUsers30d = activeUsers30d,
            invoicesByStatus = invoicesByStatus,
            invoicesOverTime = invoicesOverTime,
            revenueOverTime = revenueOverTime
        )
    }

    fun getUsers(email: String, page: Int, pageSize: Int, search: String?): AdminUserListResponse {
        requireAdmin(email)

        val pageable = PageRequest.of(page, pageSize)
        val usersPage = if (search.isNullOrBlank()) {
            userRepository.findAll(pageable)
        } else {
            userRepository.searchUsers(search, pageable)
        }

        val users = usersPage.content.map { user ->
            AdminUserResponse(
                id = user.id,
                email = user.email,
                name = user.name,
                provider = user.provider,
                isGuest = user.isGuest,
                isDisabled = user.isDisabled,
                invoiceCount = invoiceRepository.countByUserId(user.id),
                totalRevenue = invoiceRepository.sumRevenueByUserId(user.id),
                createdAt = user.createdAt
            )
        }

        return AdminUserListResponse(
            users = users,
            total = usersPage.totalElements,
            page = page,
            pageSize = pageSize
        )
    }

    fun getUserById(email: String, userId: Long): AdminUserResponse {
        requireAdmin(email)

        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        return AdminUserResponse(
            id = user.id,
            email = user.email,
            name = user.name,
            provider = user.provider,
            isGuest = user.isGuest,
            isDisabled = user.isDisabled,
            invoiceCount = invoiceRepository.countByUserId(user.id),
            totalRevenue = invoiceRepository.sumRevenueByUserId(user.id),
            createdAt = user.createdAt
        )
    }

    @Transactional
    fun updateUserStatus(email: String, userId: Long, request: UpdateUserStatusRequest): AdminUserResponse {
        requireAdmin(email)

        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        user.isDisabled = request.disabled
        user.updatedAt = LocalDateTime.now()
        userRepository.save(user)

        return AdminUserResponse(
            id = user.id,
            email = user.email,
            name = user.name,
            provider = user.provider,
            isGuest = user.isGuest,
            isDisabled = user.isDisabled,
            invoiceCount = invoiceRepository.countByUserId(user.id),
            totalRevenue = invoiceRepository.sumRevenueByUserId(user.id),
            createdAt = user.createdAt
        )
    }

    fun getInvoices(email: String, page: Int, pageSize: Int, status: InvoiceStatus?, search: String?): AdminInvoiceListResponse {
        requireAdmin(email)

        val pageable = PageRequest.of(page, pageSize)
        val hasSearch = !search.isNullOrBlank()
        val invoicesPage = when {
            status != null && hasSearch -> invoiceRepository.searchByStatusAndText(status, search!!, pageable)
            status != null -> invoiceRepository.findByStatus(status, pageable)
            hasSearch -> invoiceRepository.searchByText(search!!, pageable)
            else -> invoiceRepository.findAll(pageable)
        }

        val invoices = invoicesPage.content.map { invoice ->
            val owner = invoice.userId?.let { userRepository.findById(it).orElse(null) }
            AdminInvoiceResponse(
                id = invoice.id!!,
                invoiceNumber = invoice.invoiceNumber,
                companyName = invoice.companyName,
                clientName = invoice.clientName,
                clientEmail = invoice.clientEmail,
                totalAmount = invoice.totalAmount,
                status = invoice.status,
                ownerEmail = owner?.email,
                ownerName = owner?.name,
                invoiceDate = invoice.invoiceDate,
                createdAt = invoice.createdAt
            )
        }

        return AdminInvoiceListResponse(
            invoices = invoices,
            total = invoicesPage.totalElements,
            page = page,
            pageSize = pageSize
        )
    }

    fun getInvoiceById(email: String, invoiceId: Long): AdminInvoiceResponse {
        requireAdmin(email)

        val invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow { RuntimeException("Invoice not found") }

        val owner = invoice.userId?.let { userRepository.findById(it).orElse(null) }

        return AdminInvoiceResponse(
            id = invoice.id!!,
            invoiceNumber = invoice.invoiceNumber,
            companyName = invoice.companyName,
            clientName = invoice.clientName,
            clientEmail = invoice.clientEmail,
            totalAmount = invoice.totalAmount,
            status = invoice.status,
            ownerEmail = owner?.email,
            ownerName = owner?.name,
            invoiceDate = invoice.invoiceDate,
            createdAt = invoice.createdAt
        )
    }

    fun getSystemHealth(email: String): SystemHealthResponse {
        requireAdmin(email)

        val runtime = Runtime.getRuntime()
        val memoryUsed = runtime.totalMemory() - runtime.freeMemory()
        val memoryMax = runtime.maxMemory()
        val memoryPercent = if (memoryMax > 0) ((memoryUsed.toDouble() / memoryMax) * 100).toInt() else 0

        val uptime = ManagementFactory.getRuntimeMXBean().uptime

        val dbStatus = try {
            userRepository.count()
            "UP"
        } catch (e: Exception) {
            "DOWN"
        }

        return SystemHealthResponse(
            apiStatus = "UP",
            databaseStatus = dbStatus,
            uptime = uptime,
            jvmMemoryUsed = memoryUsed,
            jvmMemoryMax = memoryMax,
            jvmMemoryPercent = memoryPercent
        )
    }
}
