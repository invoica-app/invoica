package com.invoicer.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class AiAnalysisResponse(
    val analysisJson: String,
    val sampleImageUrl: String,
    val usageCount: Long,
    val maxFreeUses: Int
)

data class AiUsageResponse(
    val usageCount: Long,
    val maxFreeUses: Int,
    val remaining: Long,
    val isExhausted: Boolean
)

data class AiTemplateResponse(
    val id: Long,
    val name: String,
    val analysisJson: String,
    val sampleImageUrl: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class SaveAiTemplateRequest(
    @field:NotBlank(message = "Template name is required")
    val name: String,

    @field:NotBlank(message = "Analysis JSON is required")
    val analysisJson: String,

    val sampleImageUrl: String? = null
)

data class AiTemplateMappingResponse(
    val templateId: String,
    val primaryColor: String,
    val fontFamily: String,
    val confidence: Double,
    val reasoning: String
)
