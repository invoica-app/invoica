package com.invoicer.controller

import com.invoicer.dto.*
import com.invoicer.entity.InvoiceStatus
import com.invoicer.service.AdminDashboardService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val adminDashboardService: AdminDashboardService
) {

    @GetMapping("/dashboard")
    fun getDashboard(authentication: Authentication): ResponseEntity<DashboardStatsResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.getDashboardStats(email))
    }

    @GetMapping("/users")
    fun getUsers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int,
        @RequestParam(required = false) search: String?,
        authentication: Authentication
    ): ResponseEntity<AdminUserListResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.getUsers(email, page, pageSize, search))
    }

    @GetMapping("/users/{id}")
    fun getUserById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<AdminUserResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.getUserById(email, id))
    }

    @PatchMapping("/users/{id}/status")
    fun updateUserStatus(
        @PathVariable id: Long,
        @RequestBody request: UpdateUserStatusRequest,
        authentication: Authentication
    ): ResponseEntity<AdminUserResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.updateUserStatus(email, id, request))
    }

    @GetMapping("/invoices")
    fun getInvoices(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int,
        @RequestParam(required = false) status: InvoiceStatus?,
        @RequestParam(required = false) search: String?,
        authentication: Authentication
    ): ResponseEntity<AdminInvoiceListResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.getInvoices(email, page, pageSize, status, search))
    }

    @GetMapping("/invoices/{id}")
    fun getInvoiceById(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<AdminInvoiceResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.getInvoiceById(email, id))
    }

    @GetMapping("/health")
    fun getHealth(authentication: Authentication): ResponseEntity<SystemHealthResponse> {
        val email = authentication.name
        return ResponseEntity.ok(adminDashboardService.getSystemHealth(email))
    }
}
