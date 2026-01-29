package com.invoicer.config

import io.github.cdimascio.dotenv.dotenv
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.core.env.MapPropertySource
import org.springframework.stereotype.Component

@Component
class DotenvConfig : ApplicationContextInitializer<ConfigurableApplicationContext> {

    override fun initialize(applicationContext: ConfigurableApplicationContext) {
        try {
            val dotenv = dotenv {
                ignoreIfMissing = true
                systemProperties = false
            }

            val dotenvProperties = dotenv.entries()
                .associate { it.key to it.value }

            applicationContext.environment.propertySources.addFirst(
                MapPropertySource("dotenvProperties", dotenvProperties)
            )
        } catch (e: Exception) {
            // .env file not found, continue with system environment variables
            println("No .env file found, using system environment variables")
        }
    }
}
