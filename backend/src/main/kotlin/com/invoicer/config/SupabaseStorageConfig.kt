package com.invoicer.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate

@Configuration
class SupabaseStorageConfig {

    @Value("\${supabase.url:}")
    lateinit var url: String

    @Value("\${supabase.service-key:}")
    lateinit var serviceKey: String

    @Value("\${supabase.storage-bucket:logos}")
    lateinit var storageBucket: String

    @Bean
    fun restTemplate(): RestTemplate = RestTemplate()
}
