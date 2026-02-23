package com.invoicer.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class ResendConfig {

    @Value("\${resend.api-key:}")
    lateinit var apiKey: String

    @Value("\${resend.from-email:}")
    lateinit var fromEmail: String
}
