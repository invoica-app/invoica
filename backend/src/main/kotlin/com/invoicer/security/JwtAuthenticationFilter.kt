package com.invoicer.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtUtil: JwtUtil
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val token = extractTokenFromRequest(request)

            if (token != null && jwtUtil.validateToken(token)) {
                val email = jwtUtil.getEmailFromToken(token)
                val userId = jwtUtil.getUserIdFromToken(token)
                val isGuest = jwtUtil.isGuestToken(token)

                val isAdmin = jwtUtil.isAdminToken(token)

                val authorities = mutableListOf<SimpleGrantedAuthority>()
                if (isGuest) {
                    authorities.add(SimpleGrantedAuthority("ROLE_GUEST"))
                } else {
                    authorities.add(SimpleGrantedAuthority("ROLE_USER"))
                }
                if (isAdmin) {
                    authorities.add(SimpleGrantedAuthority("ROLE_ADMIN"))
                }

                val authentication = UsernamePasswordAuthenticationToken(
                    email,
                    userId,
                    authorities
                )
                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                // Store userId in authentication for easy access
                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            logger.error("Cannot set user authentication: ${e.message}")
        }

        filterChain.doFilter(request, response)
    }

    private fun extractTokenFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else {
            null
        }
    }
}
