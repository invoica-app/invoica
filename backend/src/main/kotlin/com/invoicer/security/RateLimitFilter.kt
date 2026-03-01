package com.invoicer.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger
import java.util.concurrent.atomic.AtomicLong

@Component
class RateLimitFilter : OncePerRequestFilter() {

    private val requestCounts = ConcurrentHashMap<String, RateLimitEntry>()

    companion object {
        private const val AUTH_MAX_REQUESTS = 20
        private const val AUTH_WINDOW_MS = 60_000L // 1 minute
        private const val CLEANUP_INTERVAL_MS = 300_000L // 5 minutes
    }

    @Volatile
    private var lastCleanup = System.currentTimeMillis()

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val path = request.requestURI

        // Only rate-limit auth endpoints
        if (!path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response)
            return
        }

        cleanupIfNeeded()

        val clientIp = getClientIp(request)
        val key = "$clientIp:auth"
        val now = System.currentTimeMillis()

        val entry = requestCounts.compute(key) { _, existing ->
            if (existing == null || now - existing.windowStart.get() > AUTH_WINDOW_MS) {
                RateLimitEntry(AtomicInteger(1), AtomicLong(now))
            } else {
                existing.count.incrementAndGet()
                existing
            }
        }!!

        if (entry.count.get() > AUTH_MAX_REQUESTS) {
            response.status = 429
            response.contentType = "application/json"
            response.writer.write("""{"error": "Too many requests. Please try again later."}""")
            return
        }

        filterChain.doFilter(request, response)
    }

    private fun getClientIp(request: HttpServletRequest): String {
        val forwarded = request.getHeader("X-Forwarded-For")
        return if (!forwarded.isNullOrBlank()) {
            forwarded.split(",").first().trim()
        } else {
            request.remoteAddr
        }
    }

    private fun cleanupIfNeeded() {
        val now = System.currentTimeMillis()
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now
            val cutoff = now - AUTH_WINDOW_MS * 2
            requestCounts.entries.removeIf { it.value.windowStart.get() < cutoff }
        }
    }

    private data class RateLimitEntry(
        val count: AtomicInteger,
        val windowStart: AtomicLong
    )
}
