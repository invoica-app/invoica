package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.AuthProvider
import com.invoicer.entity.User
import com.invoicer.exception.AccountDisabledException
import com.invoicer.repository.UserRepository
import com.invoicer.security.AdminService
import com.invoicer.security.JwtUtil
import com.invoicer.security.OAuthTokenVerifier
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val jwtUtil: JwtUtil,
    private val adminService: AdminService,
    private val oAuthTokenVerifier: OAuthTokenVerifier
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    fun loginWithOAuth(request: OAuthLoginRequest): AuthResponse {
        val verified = when (request.provider) {
            AuthProvider.GOOGLE -> oAuthTokenVerifier.verifyGoogleToken(request.idToken)
            AuthProvider.MICROSOFT -> oAuthTokenVerifier.verifyMicrosoftToken(request.idToken)
            else -> throw IllegalArgumentException("Unsupported OAuth provider: ${request.provider}")
        }

        val user = userRepository.findByEmail(verified.email)
            .orElseGet {
                val newUser = User(
                    email = verified.email,
                    name = verified.name,
                    provider = request.provider,
                    providerId = verified.providerId,
                    isGuest = false
                )
                userRepository.save(newUser)
            }

        if (user.isDisabled) {
            logger.warn("AUDIT: Login blocked for disabled account email={} provider={}", verified.email, request.provider)
            throw AccountDisabledException("Account is disabled")
        }

        // Update user info if changed
        if (user.name != verified.name) {
            user.name = verified.name
            user.updatedAt = LocalDateTime.now()
            userRepository.save(user)
        }

        val isAdmin = adminService.isAdmin(user.email)
        val token = jwtUtil.generateToken(user.email, user.id, user.isGuest, isAdmin = isAdmin)

        logger.info("AUDIT: OAuth login success email={} provider={} userId={}", user.email, request.provider, user.id)

        return AuthResponse(
            token = token,
            user = user.toDto(isAdmin = isAdmin)
        )
    }

    fun loginAsGuest(): AuthResponse {
        val guestEmail = "guest-${UUID.randomUUID()}@invoica.app"

        val guestUser = User(
            email = guestEmail,
            name = "Guest User",
            provider = AuthProvider.GUEST,
            isGuest = true
        )

        val savedUser = userRepository.save(guestUser)
        val token = jwtUtil.generateToken(savedUser.email, savedUser.id, isGuest = true)

        logger.info("AUDIT: Guest login userId={}", savedUser.id)

        return AuthResponse(
            token = token,
            user = savedUser.toDto()
        )
    }

    @Transactional(readOnly = true)
    fun getCurrentUser(email: String): UserDto {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("User not found") }
        return user.toDto(isAdmin = adminService.isAdmin(user.email))
    }

    private fun User.toDto(isAdmin: Boolean = false) = UserDto(
        id = id,
        email = email,
        name = name,
        provider = provider,
        isGuest = isGuest,
        isAdmin = isAdmin
    )
}
