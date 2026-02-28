package com.invoicer.dto

import java.time.LocalDateTime

data class FeedbackRequest(
    val type: String,
    val category: String? = null,
    val rating: Int? = null,
    val npsScore: Int? = null,
    val easeScore: Int? = null,
    val message: String? = null,
    val invoiceId: Long? = null,
    val page: String? = null,
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
