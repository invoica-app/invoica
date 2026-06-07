package com.invoicer.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class PaystackConfig {

    @Value("\${paystack.secret-key:}")
    lateinit var secretKey: String

    @Value("\${paystack.public-key:}")
    lateinit var publicKey: String

    @Value("\${paystack.pro-plan-amount:999}")
    var proPlanAmount: Int = 999

    @Value("\${paystack.currency:GHS}")
    lateinit var currency: String

    @Value("\${paystack.callback-url:http://localhost:3000/upgrade/verify}")
    lateinit var callbackUrl: String
}
