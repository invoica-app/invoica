package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.Feedback
import com.invoicer.exception.AdminAccessDeniedException
import com.invoicer.repository.FeedbackRepository
import com.invoicer.security.AdminService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class FeedbackService(
    private val feedbackRepository: FeedbackRepository,
    private val adminService: AdminService
) {

    fun save(request: FeedbackRequest, userId: Long): FeedbackResponse {
        val dailyCount = feedbackRepository.countByUserIdAndCreatedAtAfter(
            userId, LocalDateTime.now().minusDays(1)
        )
        if (dailyCount >= 5) {
            throw RuntimeException("Rate limit exceeded: maximum 5 feedback submissions per day")
        }

        val feedback = Feedback(
            userId = userId,
            type = request.type,
            category = request.category,
            rating = request.rating,
            npsScore = request.npsScore,
            easeScore = request.easeScore,
            message = request.message,
            invoiceId = request.invoiceId,
            page = request.page,
            userAgent = request.userAgent
        )

        val saved = feedbackRepository.save(feedback)
        return saved.toResponse()
    }

    @Transactional(readOnly = true)
    fun existsByUserAndInvoice(userId: Long, invoiceId: Long): Boolean {
        return feedbackRepository.existsByUserIdAndInvoiceId(userId, invoiceId)
    }

    @Transactional(readOnly = true)
    fun countByUser(userId: Long): Long {
        return feedbackRepository.countByUserId(userId)
    }

    @Transactional(readOnly = true)
    fun getAllFeedback(email: String, page: Int, size: Int, type: String?, category: String?): FeedbackListResponse {
        requireAdmin(email)

        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val feedbackPage = when {
            !type.isNullOrBlank() -> feedbackRepository.findByType(type, pageable)
            !category.isNullOrBlank() -> feedbackRepository.findByCategory(category, pageable)
            else -> feedbackRepository.findAll(pageable)
        }

        return FeedbackListResponse(
            feedback = feedbackPage.content.map { it.toResponse() },
            total = feedbackPage.totalElements,
            page = page,
            pageSize = size
        )
    }

    @Transactional(readOnly = true)
    fun getDashboardStats(email: String): FeedbackStats {
        requireAdmin(email)

        val avgRating = feedbackRepository.averageRating()
        val totalCount = feedbackRepository.count()
        val npsResponses = feedbackRepository.countNpsResponses()
        val npsScore = if (npsResponses > 0) {
            val promoters = feedbackRepository.countPromoters()
            val detractors = feedbackRepository.countDetractors()
            ((promoters - detractors).toDouble() / npsResponses) * 100
        } else {
            0.0
        }

        val categoryBreakdown = feedbackRepository.countByCategory().associate { row ->
            (row[0] as String) to (row[1] as Long)
        }

        return FeedbackStats(
            averageRating = avgRating,
            totalCount = totalCount,
            npsScore = npsScore,
            categoryBreakdown = categoryBreakdown
        )
    }

    private fun requireAdmin(email: String) {
        if (!adminService.isAdmin(email)) {
            throw AdminAccessDeniedException("Admin access required")
        }
    }

    private fun Feedback.toResponse() = FeedbackResponse(
        id = id,
        userId = userId,
        type = type,
        category = category,
        rating = rating,
        npsScore = npsScore,
        easeScore = easeScore,
        message = message,
        invoiceId = invoiceId,
        page = page,
        userAgent = userAgent,
        createdAt = createdAt
    )
}
