package com.invoicer.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration

@Configuration
class AnthropicConfig {

    @Value("\${anthropic.api-key:}")
    lateinit var apiKey: String

    @Value("\${anthropic.model:claude-sonnet-4-20250514}")
    lateinit var model: String

    @Value("\${anthropic.max-tokens:4096}")
    var maxTokens: Int = 4096

    @Value("\${ai.max-free-uses:3}")
    var maxFreeUses: Int = 3
}
