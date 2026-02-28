package com.invoicer.controller

import com.invoicer.dto.*
import com.invoicer.service.FeedbackService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/feedback")
class FeedbackController(
    private val feedbackService: FeedbackService
) {

    @PostMapping
    fun submitFeedback(
        @RequestBody request: FeedbackRequest,
        authentication: Authentication
    ): ResponseEntity<FeedbackResponse> {
        val userId = authentication.credentials as Long
        val response = feedbackService.save(request, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping("/check/{invoiceId}")
    fun checkFeedback(
        @PathVariable invoiceId: Long,
        authentication: Authentication
    ): ResponseEntity<FeedbackCheckResponse> {
        val userId = authentication.credentials as Long
        val given = feedbackService.existsByUserAndInvoice(userId, invoiceId)
        return ResponseEntity.ok(FeedbackCheckResponse(feedbackGiven = given))
    }

    @GetMapping("/count")
    fun getFeedbackCount(
        authentication: Authentication
    ): ResponseEntity<FeedbackCountResponse> {
        val userId = authentication.credentials as Long
        val count = feedbackService.countByUser(userId)
        return ResponseEntity.ok(FeedbackCountResponse(count = count))
    }

    @GetMapping("/admin/list")
    fun getAdminFeedbackList(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) category: String?,
        authentication: Authentication
    ): ResponseEntity<FeedbackListResponse> {
        val email = authentication.name
        return ResponseEntity.ok(feedbackService.getAllFeedback(email, page, size, type, category))
    }

    @GetMapping("/admin/stats")
    fun getAdminFeedbackStats(
        authentication: Authentication
    ): ResponseEntity<FeedbackStats> {
        val email = authentication.name
        return ResponseEntity.ok(feedbackService.getDashboardStats(email))
    }
}
