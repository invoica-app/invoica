package com.invoicer.security

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.invoicer.exception.OAuthAuthenticationException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtDecoders
import org.springframework.stereotype.Component

data class VerifiedOAuthUser(
    val email: String,
    val name: String,
    val providerId: String
)

@Component
class OAuthTokenVerifier(
    @Value("\${oauth.google.client-id:}")
    private val googleClientId: String,

    @Value("\${oauth.microsoft.client-id:}")
    private val microsoftClientId: String
) {
    private val logger = LoggerFactory.getLogger(OAuthTokenVerifier::class.java)

    private val googleVerifier: GoogleIdTokenVerifier by lazy {
        GoogleIdTokenVerifier.Builder(NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(listOf(googleClientId))
            .build()
    }

    fun verifyGoogleToken(idToken: String): VerifiedOAuthUser {
        val token: GoogleIdToken = googleVerifier.verify(idToken)
            ?: throw OAuthAuthenticationException("Invalid Google ID token")

        val payload = token.payload
        val email = payload.email
            ?: throw OAuthAuthenticationException("Google token missing email")

        if (!payload.emailVerified) {
            throw OAuthAuthenticationException("Google email not verified")
        }

        return VerifiedOAuthUser(
            email = email,
            name = payload["name"] as? String ?: email,
            providerId = payload.subject
        )
    }

    fun verifyMicrosoftToken(idToken: String): VerifiedOAuthUser {
        try {
            val decoder: JwtDecoder = JwtDecoders.fromIssuerLocation("https://login.microsoftonline.com/common/v2.0")
            val jwt = decoder.decode(idToken)

            val email = jwt.getClaimAsString("email")
                ?: jwt.getClaimAsString("preferred_username")
                ?: throw OAuthAuthenticationException("Microsoft token missing email")

            val aud = jwt.audience
            if (microsoftClientId.isNotBlank() && !aud.contains(microsoftClientId)) {
                throw OAuthAuthenticationException("Microsoft token audience mismatch")
            }

            return VerifiedOAuthUser(
                email = email,
                name = jwt.getClaimAsString("name") ?: email,
                providerId = jwt.subject
            )
        } catch (e: OAuthAuthenticationException) {
            throw e
        } catch (e: Exception) {
            logger.error("Microsoft token verification failed", e)
            throw OAuthAuthenticationException("Invalid Microsoft ID token")
        }
    }
}
