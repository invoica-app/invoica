package com.invoicer.service

import com.invoicer.config.PaystackConfig
import com.invoicer.entity.UserPlan
import com.invoicer.repository.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.client.RestTemplate
import java.time.LocalDateTime

@Service
class PaystackService(
    private val paystackConfig: PaystackConfig,
    private val userRepository: UserRepository,
    private val restTemplate: RestTemplate,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(PaystackService::class.java)

    companion object {
        private const val PAYSTACK_API = "https://api.paystack.co"
    }

    fun initializeTransaction(userId: Long, email: String): Map<String, Any> {
        val headers = HttpHeaders().apply {
            setBearerAuth(paystackConfig.secretKey)
            contentType = MediaType.APPLICATION_JSON
        }

        val body = mapOf(
            "email" to email,
            "amount" to paystackConfig.proPlanAmount,
            "currency" to paystackConfig.currency,
            "callback_url" to paystackConfig.callbackUrl,
            "metadata" to mapOf(
                "user_id" to userId,
                "plan" to "PRO"
            )
        )

        val entity = HttpEntity(body, headers)
        val response = restTemplate.exchange(
            "$PAYSTACK_API/transaction/initialize",
            HttpMethod.POST,
            entity,
            String::class.java
        )

        val responseBody = objectMapper.readTree(response.body)
        if (responseBody.get("status")?.asBoolean() != true) {
            throw RuntimeException("Failed to initialize Paystack transaction")
        }

        val data = responseBody.get("data")
        return mapOf(
            "authorizationUrl" to data.get("authorization_url").asText(),
            "accessCode" to data.get("access_code").asText(),
            "reference" to data.get("reference").asText()
        )
    }

    fun verifyTransaction(reference: String): Map<String, Any> {
        val headers = HttpHeaders().apply {
            setBearerAuth(paystackConfig.secretKey)
        }

        val entity = HttpEntity<Void>(headers)
        val response = restTemplate.exchange(
            "$PAYSTACK_API/transaction/verify/$reference",
            HttpMethod.GET,
            entity,
            String::class.java
        )

        val responseBody = objectMapper.readTree(response.body)
        if (responseBody.get("status")?.asBoolean() != true) {
            throw RuntimeException("Failed to verify transaction")
        }

        val data = responseBody.get("data")
        val status = data.get("status").asText()

        return mapOf(
            "status" to status,
            "reference" to reference,
            "amount" to data.get("amount").asInt(),
            "currency" to data.get("currency").asText()
        )
    }

    @Transactional
    fun upgradeUser(userId: Long) {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }
        user.plan = UserPlan.PRO
        user.updatedAt = LocalDateTime.now()
        userRepository.save(user)
        logger.info("AUDIT: User upgraded to PRO userId={}", userId)
    }

    @Transactional
    fun handleWebhook(payload: String, signature: String): Boolean {
        val event = objectMapper.readTree(payload)
        val eventType = event.get("event")?.asText() ?: return false

        if (eventType != "charge.success") return true

        val data = event.get("data") ?: return false
        val metadata = data.get("metadata") ?: return false
        val userId = metadata.get("user_id")?.asLong() ?: return false
        val plan = metadata.get("plan")?.asText() ?: return false

        if (plan == "PRO") {
            upgradeUser(userId)
        }

        return true
    }

    fun getPublicKey(): String = paystackConfig.publicKey
    fun getProPlanAmount(): Int = paystackConfig.proPlanAmount
    fun getCurrency(): String = paystackConfig.currency
}
