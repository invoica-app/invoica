package com.invoicer.controller

import com.invoicer.dto.AiAnalysisResponse
import com.invoicer.dto.AiTemplateMappingResponse
import com.invoicer.dto.AiTemplateResponse
import com.invoicer.dto.AiUsageResponse
import com.invoicer.dto.SaveAiTemplateRequest
import com.invoicer.service.AiFeatureService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/ai")
class AiController(
    private val aiFeatureService: AiFeatureService
) {

    @PostMapping("/analyze-invoice")
    fun analyzeInvoice(
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication
    ): ResponseEntity<AiAnalysisResponse> {
        val userId = authentication.credentials as Long
        val result = aiFeatureService.analyzeInvoice(file, userId)
        return ResponseEntity.ok(result)
    }

    @GetMapping("/usage")
    fun getUsage(authentication: Authentication): ResponseEntity<AiUsageResponse> {
        val userId = authentication.credentials as Long
        val usage = aiFeatureService.getUsage(userId)
        return ResponseEntity.ok(usage)
    }

    @PostMapping("/templates")
    fun saveTemplate(
        @Valid @RequestBody request: SaveAiTemplateRequest,
        authentication: Authentication
    ): ResponseEntity<AiTemplateResponse> {
        val userId = authentication.credentials as Long
        val template = aiFeatureService.saveTemplate(request, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(template)
    }

    @GetMapping("/templates")
    fun getTemplates(authentication: Authentication): ResponseEntity<List<AiTemplateResponse>> {
        val userId = authentication.credentials as Long
        val templates = aiFeatureService.getTemplates(userId)
        return ResponseEntity.ok(templates)
    }

    @PostMapping("/map-template")
    fun mapTemplate(
        @RequestBody body: Map<String, String>,
        authentication: Authentication
    ): ResponseEntity<AiTemplateMappingResponse> {
        val analysisJson = body["analysisJson"]
            ?: return ResponseEntity.badRequest().build()
        val result = aiFeatureService.mapTemplate(analysisJson)
        return ResponseEntity.ok(result)
    }
}
