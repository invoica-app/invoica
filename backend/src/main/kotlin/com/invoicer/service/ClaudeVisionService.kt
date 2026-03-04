package com.invoicer.service

import com.invoicer.config.AnthropicConfig
import com.invoicer.exception.AiAnalysisFailedException
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.util.Base64

@Service
class ClaudeVisionService(
    private val restTemplate: RestTemplate,
    private val anthropicConfig: AnthropicConfig,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(ClaudeVisionService::class.java)

    companion object {
        private const val CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
        private const val ANTHROPIC_VERSION = "2023-06-01"

        private val VISION_PROMPT = """
            Analyze this invoice image and extract its visual design characteristics. Return ONLY valid JSON (no markdown fences, no explanatory text) with the following structure:

            {
              "layout": {
                "style": "modern" | "classic" | "minimal" | "corporate" | "creative",
                "colorScheme": {
                  "primary": "#hexcolor",
                  "secondary": "#hexcolor",
                  "accent": "#hexcolor",
                  "background": "#hexcolor",
                  "text": "#hexcolor",
                  "tableHeader": "#hexcolor",
                  "tableStripe": "#hexcolor"
                },
                "hasHeaderBar": true/false,
                "headerBarColor": "#hexcolor or null",
                "logoPosition": "left" | "right" | "center",
                "alignment": "left" | "center"
              },
              "sections": [
                {
                  "type": "header" | "companyInfo" | "billTo" | "invoiceMeta" | "lineItems" | "totals" | "notes" | "footer" | "signature",
                  "position": "top" | "middle" | "bottom",
                  "layout": "full-width" | "two-column" | "right-aligned"
                }
              ],
              "typography": {
                "headingFont": "sans-serif" | "serif" | "monospace",
                "bodyFont": "sans-serif" | "serif" | "monospace",
                "headingSize": "large" | "medium" | "small",
                "headingWeight": "bold" | "normal" | "light",
                "bodySize": "medium" | "small",
                "uppercase": true/false
              },
              "tableStyle": {
                "hasHeader": true/false,
                "headerBackground": "#hexcolor",
                "headerTextColor": "#hexcolor",
                "hasBorders": true/false,
                "borderColor": "#hexcolor",
                "hasAlternatingRows": true/false,
                "alternatingRowColor": "#hexcolor",
                "cellPadding": "compact" | "normal" | "spacious"
              },
              "detectedCurrency": "USD" | "GHS" | "EUR" | "GBP" | "NGN" or other ISO code detected,
              "specialFeatures": {
                "hasWatermark": false,
                "hasSignatureLine": true/false,
                "hasFooterBar": true/false,
                "footerBarColor": "#hexcolor or null",
                "amountBoxStyle": "none" | "bordered" | "filled",
                "amountBoxColor": "#hexcolor or null",
                "hasDividers": true/false,
                "dividerStyle": "solid" | "dashed" | "dotted",
                "borderRadius": "none" | "small" | "medium" | "large"
              }
            }

            Be accurate about colors - use the exact hex values you observe. If you can't determine a value, use sensible defaults. Focus on the visual design, not the content.
        """.trimIndent()
    }

    fun analyzeInvoiceImage(imageBytes: ByteArray, contentType: String?): String {
        val base64Image = Base64.getEncoder().encodeToString(imageBytes)
        val mediaType = contentType ?: "image/png"

        val headers = HttpHeaders().apply {
            set("x-api-key", anthropicConfig.apiKey)
            set("anthropic-version", ANTHROPIC_VERSION)
            setContentType(MediaType.APPLICATION_JSON)
        }

        val requestBody = mapOf(
            "model" to anthropicConfig.model,
            "max_tokens" to anthropicConfig.maxTokens,
            "messages" to listOf(
                mapOf(
                    "role" to "user",
                    "content" to listOf(
                        mapOf(
                            "type" to "image",
                            "source" to mapOf(
                                "type" to "base64",
                                "media_type" to mediaType,
                                "data" to base64Image
                            )
                        ),
                        mapOf(
                            "type" to "text",
                            "text" to VISION_PROMPT
                        )
                    )
                )
            )
        )

        val entity = HttpEntity(requestBody, headers)

        try {
            val response = restTemplate.exchange(
                CLAUDE_API_URL,
                HttpMethod.POST,
                entity,
                String::class.java
            )

            if (!response.statusCode.is2xxSuccessful) {
                logger.error("Claude API returned status: ${response.statusCode}")
                throw AiAnalysisFailedException("Claude API returned status: ${response.statusCode}")
            }

            val responseBody = response.body
                ?: throw AiAnalysisFailedException("Empty response from Claude API")

            return extractAnalysisJson(responseBody)
        } catch (ex: AiAnalysisFailedException) {
            throw ex
        } catch (ex: Exception) {
            logger.error("Claude API call failed", ex)
            throw AiAnalysisFailedException("Failed to analyze invoice image: ${ex.message}", ex)
        }
    }

    private fun extractAnalysisJson(responseBody: String): String {
        val responseNode = objectMapper.readTree(responseBody)
        val contentArray = responseNode.get("content")
            ?: throw AiAnalysisFailedException("No content in Claude response")

        val textContent = contentArray.firstOrNull { it.get("type")?.asText() == "text" }
            ?: throw AiAnalysisFailedException("No text content in Claude response")

        var text = textContent.get("text")?.asText()
            ?: throw AiAnalysisFailedException("Empty text in Claude response")

        // Strip markdown code fences if present
        text = text.trim()
        if (text.startsWith("```json")) {
            text = text.removePrefix("```json").trimStart()
        } else if (text.startsWith("```")) {
            text = text.removePrefix("```").trimStart()
        }
        if (text.endsWith("```")) {
            text = text.removeSuffix("```").trimEnd()
        }

        // Validate it's valid JSON
        try {
            objectMapper.readTree(text)
        } catch (ex: Exception) {
            logger.error("Claude returned invalid JSON: $text")
            throw AiAnalysisFailedException("Claude returned invalid JSON response")
        }

        return text
    }
}
