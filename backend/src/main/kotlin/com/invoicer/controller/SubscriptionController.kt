package com.invoicer.controller

import com.invoicer.service.PaystackService
import com.invoicer.repository.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/subscription")
class SubscriptionController(
    private val paystackService: PaystackService,
    private val userRepository: UserRepository
) {

    @PostMapping("/initialize")
    fun initializePayment(authentication: Authentication): ResponseEntity<Map<String, Any>> {
        val userId = authentication.credentials as Long
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found") }

        val result = paystackService.initializeTransaction(userId, user.email)
        return ResponseEntity.ok(result)
    }

    @GetMapping("/verify/{reference}")
    fun verifyPayment(
        @PathVariable reference: String
    ): ResponseEntity<Map<String, Any>> {
        val result = paystackService.verifyAndUpgrade(reference)
        return ResponseEntity.ok(result)
    }

    @GetMapping("/config")
    fun getConfig(authentication: Authentication): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "publicKey" to paystackService.getPublicKey(),
            "amount" to paystackService.getProPlanAmount(),
            "currency" to paystackService.getCurrency()
        ))
    }

    @PostMapping("/webhook")
    fun handleWebhook(
        @RequestBody payload: String,
        @RequestHeader("x-paystack-signature", required = false) signature: String?
    ): ResponseEntity<String> {
        paystackService.handleWebhook(payload, signature ?: "")
        return ResponseEntity.ok("ok")
    }
}
