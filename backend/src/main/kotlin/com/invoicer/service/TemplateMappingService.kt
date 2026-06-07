package com.invoicer.service

import com.invoicer.dto.AiTemplateMappingResponse
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service

@Service
class TemplateMappingService(
    private val objectMapper: ObjectMapper
) {
    private data class TemplateProfile(
        val id: String,
        val layoutStyle: String,
        val hasHeaderBar: Boolean,
        val prefersSansSerif: Boolean,
        val prefersMinimal: Boolean,
        val prefersFormality: Int
    )

    private val templates = listOf(
        TemplateProfile("modern", "modern", hasHeaderBar = true, prefersSansSerif = true, prefersMinimal = false, prefersFormality = 3),
        TemplateProfile("classic", "classic", hasHeaderBar = false, prefersSansSerif = false, prefersMinimal = false, prefersFormality = 4),
        TemplateProfile("enterprise", "corporate", hasHeaderBar = true, prefersSansSerif = true, prefersMinimal = false, prefersFormality = 5),
        TemplateProfile("freelancer", "minimal", hasHeaderBar = false, prefersSansSerif = true, prefersMinimal = true, prefersFormality = 1),
        TemplateProfile("corporate", "corporate", hasHeaderBar = true, prefersSansSerif = true, prefersMinimal = false, prefersFormality = 4)
    )

    private val relatedStyles = mapOf(
        "modern" to setOf("minimal", "creative"),
        "classic" to setOf("corporate"),
        "corporate" to setOf("classic"),
        "minimal" to setOf("modern", "creative"),
        "creative" to setOf("modern", "minimal")
    )

    fun mapTemplate(analysisJson: String): AiTemplateMappingResponse {
        val analysis = objectMapper.readTree(analysisJson)
        val layout = analysis.get("layout")
        val typography = analysis.get("typography")

        val scores = templates.map { it to scoreTemplate(it, layout, typography) }
            .sortedByDescending { it.second }

        val best = scores.first()

        return AiTemplateMappingResponse(
            templateId = best.first.id,
            primaryColor = extractPrimaryColor(layout),
            fontFamily = mapFontFamily(typography),
            confidence = best.second.coerceIn(0.0, 1.0),
            reasoning = "Matched '${best.first.id}' template based on detected '${layout?.get("style")?.asText() ?: "unknown"}' layout style"
        )
    }

    private fun scoreTemplate(template: TemplateProfile, layout: JsonNode?, typography: JsonNode?): Double {
        var score = 0.0

        val style = layout?.get("style")?.asText() ?: "modern"
        if (style == template.layoutStyle) score += 0.4
        else if (relatedStyles[style]?.contains(template.layoutStyle) == true) score += 0.2

        val hasHeader = layout?.get("hasHeaderBar")?.asBoolean() ?: false
        if (hasHeader == template.hasHeaderBar) score += 0.15

        val headingFont = typography?.get("headingFont")?.asText() ?: "sans-serif"
        if ((headingFont == "sans-serif") == template.prefersSansSerif) score += 0.1

        val headingSize = typography?.get("headingSize")?.asText() ?: "medium"
        if ((headingSize == "small") == template.prefersMinimal) score += 0.1

        val alignment = layout?.get("alignment")?.asText() ?: "left"
        if (alignment == "center" && template.prefersFormality >= 4) score += 0.05
        if (alignment == "left" && template.prefersFormality <= 3) score += 0.05

        val uppercase = typography?.get("uppercase")?.asBoolean() ?: false
        if (uppercase && template.prefersFormality >= 4) score += 0.1
        if (!uppercase && template.prefersFormality <= 2) score += 0.1

        return score
    }

    private fun extractPrimaryColor(layout: JsonNode?): String {
        return layout?.get("colorScheme")?.get("primary")?.asText() ?: "#7C3AED"
    }

    private fun mapFontFamily(typography: JsonNode?): String {
        return when (typography?.get("headingFont")?.asText()) {
            "serif" -> "Georgia"
            "monospace" -> "JetBrains Mono"
            else -> "Inter"
        }
    }
}
