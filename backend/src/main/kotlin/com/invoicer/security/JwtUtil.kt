package com.invoicer.security

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.Date
import javax.crypto.SecretKey

@Component
class JwtUtil {

    @Value("\${jwt.secret:your-256-bit-secret-key-change-this-in-production-please-make-it-long-enough}")
    private lateinit var secret: String

    @Value("\${jwt.expiration:86400000}") // 24 hours in milliseconds
    private var expiration: Long = 86400000

    @PostConstruct
    fun validateSecret() {
        require(secret.toByteArray().size >= 32) {
            "JWT secret must be at least 32 bytes (256 bits) for HMAC-SHA256. Current: ${secret.toByteArray().size} bytes."
        }
    }

    private fun getSigningKey(): SecretKey {
        return Keys.hmacShaKeyFor(secret.toByteArray())
    }

    fun generateToken(email: String, userId: Long, isGuest: Boolean = false): String {
        val claims = mapOf(
            "userId" to userId,
            "email" to email,
            "isGuest" to isGuest
        )

        return Jwts.builder()
            .claims(claims)
            .subject(email)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact()
    }

    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun getEmailFromToken(token: String): String {
        return getClaims(token).subject
    }

    fun getUserIdFromToken(token: String): Long {
        return getClaims(token)["userId"].toString().toLong()
    }

    fun isGuestToken(token: String): Boolean {
        return getClaims(token)["isGuest"] as? Boolean ?: false
    }

    private fun getClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .payload
    }
}
