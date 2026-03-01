package com.invoicer.dto

import jakarta.validation.constraints.*
import java.time.LocalDateTime

data class FeedbackRequest(
    @field:NotBlank(message = "Feedback type is required")
    @field:Size(max = 50, message = "Type must be at most 50 characters")
    val type: String,

    @field:Size(max = 100, message = "Category must be at most 100 characters")
    val category: String? = null,

    @field:Min(1, message = "Rating must be between 1 and 5")
    @field:Max(5, message = "Rating must be between 1 and 5")
    val rating: Int? = null,

    @field:Min(0, message = "NPS score must be between 0 and 10")
    @field:Max(10, message = "NPS score must be between 0 and 10")
    val npsScore: Int? = null,

    @field:Min(1, message = "Ease score must be between 1 and 5")
    @field:Max(5, message = "Ease score must be between 1 and 5")
    val easeScore: Int? = null,

    @field:Size(max = 5000, message = "Message must be at most 5000 characters")
    val message: String? = null,

    val invoiceId: Long? = null,

    @field:Size(max = 200, message = "Page must be at most 200 characters")
    val page: String? = null,

    @field:Size(max = 500, message = "User agent must be at most 500 characters")
    val userAgent: String? = null
)

data class FeedbackResponse(
    val id: Long,
    val userId: Long,
    val type: String,
    val category: String?,
    val rating: Int?,
    val npsScore: Int?,
    val easeScore: Int?,
    val message: String?,
    val invoiceId: Long?,
    val page: String?,
    val userAgent: String?,
    val createdAt: LocalDateTime
)

data class FeedbackCheckResponse(
    val feedbackGiven: Boolean
)

data class FeedbackCountResponse(
    val count: Long
)

data class FeedbackStats(
    val averageRating: Double,
    val totalCount: Long,
    val npsScore: Double,
    val categoryBreakdown: Map<String, Long>
)

data class FeedbackListResponse(
    val feedback: List<FeedbackResponse>,
    val total: Long,
    val page: Int,
    val pageSize: Int
)
