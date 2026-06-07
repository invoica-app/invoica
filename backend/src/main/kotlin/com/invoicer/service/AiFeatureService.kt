package com.invoicer.service

import com.invoicer.config.AnthropicConfig
import com.invoicer.dto.AiAnalysisResponse
import com.invoicer.dto.AiTemplateResponse
import com.invoicer.dto.AiUsageResponse
import com.invoicer.dto.SaveAiTemplateRequest
import com.invoicer.entity.AiFeatureUsage
import com.invoicer.entity.AiGeneratedTemplate
import com.invoicer.exception.AiAnalysisFailedException
import com.invoicer.exception.AiUsageExhaustedException
import com.invoicer.dto.AiTemplateMappingResponse
import com.invoicer.entity.UserPlan
import com.invoicer.repository.AiFeatureUsageRepository
import com.invoicer.repository.AiGeneratedTemplateRepository
import com.invoicer.repository.UserRepository
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.rendering.PDFRenderer
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

@Service
class AiFeatureService(
    private val aiFeatureUsageRepository: AiFeatureUsageRepository,
    private val aiGeneratedTemplateRepository: AiGeneratedTemplateRepository,
    private val claudeVisionService: ClaudeVisionService,
    private val storageService: StorageService,
    private val anthropicConfig: AnthropicConfig,
    private val userRepository: UserRepository,
    private val templateMappingService: TemplateMappingService
) {
    private val logger = LoggerFactory.getLogger(AiFeatureService::class.java)

    companion object {
        private const val FEATURE_NAME = "invoice_analysis"
        private val ALLOWED_CONTENT_TYPES = setOf(
            "image/png", "image/jpeg", "image/jpg", "image/webp",
            "application/pdf"
        )
        private const val MAX_FILE_SIZE = 5 * 1024 * 1024L // 5MB
    }

    fun analyzeInvoice(file: MultipartFile, userId: Long): AiAnalysisResponse {
        // Validate file
        val contentType = file.contentType?.lowercase()
        if (contentType == null || contentType !in ALLOWED_CONTENT_TYPES) {
            throw IllegalArgumentException("Only PNG, JPG, JPEG, and WebP images are allowed")
        }
        if (file.size > MAX_FILE_SIZE) {
            throw IllegalArgumentException("File size must not exceed 5MB")
        }

        // Check usage — PRO users get unlimited
        val user = userRepository.findById(userId).orElseThrow { RuntimeException("User not found") }
        if (user.plan != UserPlan.PRO) {
            val usageCount = aiFeatureUsageRepository.countByUserIdAndFeatureAndSuccessTrue(userId, FEATURE_NAME)
            if (usageCount >= anthropicConfig.maxFreeUses) {
                throw AiUsageExhaustedException("You have used all ${anthropicConfig.maxFreeUses} free AI analyses. Upgrade to continue.")
            }
        }

        // Convert PDF to image if needed
        val (imageBytes, imageContentType) = if (contentType == "application/pdf") {
            convertPdfToImage(file.bytes)
        } else {
            file.bytes to (file.contentType ?: "image/png")
        }

        // Upload the image (converted if PDF) to Supabase
        val sampleImageUrl = try {
            storageService.uploadBytes(imageBytes, imageContentType, file.originalFilename?.replace(".pdf", ".png") ?: "invoice.png", "ai-samples")
        } catch (ex: Exception) {
            logger.error("Failed to upload sample image", ex)
            throw AiAnalysisFailedException("Failed to upload sample image: ${ex.message}", ex)
        }

        // Create usage record (success = false initially)
        val usage = AiFeatureUsage(
            userId = userId,
            feature = FEATURE_NAME,
            sampleImageUrl = sampleImageUrl
        )

        try {
            val analysisJson = claudeVisionService.analyzeInvoiceImage(imageBytes, imageContentType)

            // Mark as successful
            usage.analysisResult = analysisJson
            usage.success = true
            aiFeatureUsageRepository.save(usage)

            val totalUsage = aiFeatureUsageRepository.countByUserIdAndFeatureAndSuccessTrue(userId, FEATURE_NAME)
            return AiAnalysisResponse(
                analysisJson = analysisJson,
                sampleImageUrl = sampleImageUrl,
                usageCount = totalUsage,
                maxFreeUses = anthropicConfig.maxFreeUses
            )
        } catch (ex: AiAnalysisFailedException) {
            // Save failed attempt
            usage.success = false
            aiFeatureUsageRepository.save(usage)
            throw ex
        } catch (ex: Exception) {
            usage.success = false
            aiFeatureUsageRepository.save(usage)
            throw AiAnalysisFailedException("Failed to analyze invoice: ${ex.message}", ex)
        }
    }

    fun getUsage(userId: Long): AiUsageResponse {
        val user = userRepository.findById(userId).orElseThrow { RuntimeException("User not found") }
        val usageCount = aiFeatureUsageRepository.countByUserIdAndFeatureAndSuccessTrue(userId, FEATURE_NAME)
        val maxFreeUses = anthropicConfig.maxFreeUses
        val isPro = user.plan == UserPlan.PRO
        val remaining = if (isPro) Long.MAX_VALUE else (maxFreeUses - usageCount).coerceAtLeast(0)
        return AiUsageResponse(
            usageCount = usageCount,
            maxFreeUses = if (isPro) Int.MAX_VALUE else maxFreeUses,
            remaining = remaining,
            isExhausted = !isPro && remaining <= 0
        )
    }

    fun saveTemplate(request: SaveAiTemplateRequest, userId: Long): AiTemplateResponse {
        val template = AiGeneratedTemplate(
            userId = userId,
            name = request.name,
            analysisJson = request.analysisJson,
            sampleImageUrl = request.sampleImageUrl
        )
        val saved = aiGeneratedTemplateRepository.save(template)
        return toTemplateResponse(saved)
    }

    fun getTemplates(userId: Long): List<AiTemplateResponse> {
        return aiGeneratedTemplateRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .map { toTemplateResponse(it) }
    }

    fun mapTemplate(analysisJson: String): AiTemplateMappingResponse {
        return templateMappingService.mapTemplate(analysisJson)
    }

    private fun convertPdfToImage(pdfBytes: ByteArray): Pair<ByteArray, String> {
        try {
            PDDocument.load(pdfBytes).use { document ->
                val renderer = PDFRenderer(document)
                val image = renderer.renderImageWithDPI(0, 200f)
                val outputStream = ByteArrayOutputStream()
                ImageIO.write(image, "png", outputStream)
                return outputStream.toByteArray() to "image/png"
            }
        } catch (ex: Exception) {
            logger.error("Failed to convert PDF to image", ex)
            throw AiAnalysisFailedException("Failed to process PDF file: ${ex.message}", ex)
        }
    }

    private fun toTemplateResponse(template: AiGeneratedTemplate): AiTemplateResponse {
        return AiTemplateResponse(
            id = template.id,
            name = template.name,
            analysisJson = template.analysisJson,
            sampleImageUrl = template.sampleImageUrl,
            createdAt = template.createdAt,
            updatedAt = template.updatedAt
        )
    }
}
