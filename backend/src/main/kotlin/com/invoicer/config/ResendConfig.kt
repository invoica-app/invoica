package com.invoicer.config

import com.resend.Resend
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class ResendConfig {

    @Value("\${resend.api-key:}")
    lateinit var apiKey: String

    @Value("\${resend.from-email:}")
    lateinit var fromEmail: String

    @Bean
    fun resendClient(): Resend? {
        return if (apiKey.isNotBlank()) Resend(apiKey) else null
    }
}
