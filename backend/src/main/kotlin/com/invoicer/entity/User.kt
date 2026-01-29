package com.invoicer.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = false)
    val name: String,

    @Column(name = "provider")
    @Enumerated(EnumType.STRING)
    val provider: AuthProvider,

    @Column(name = "provider_id")
    val providerId: String? = null,

    @Column(name = "is_guest")
    val isGuest: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class AuthProvider {
    GOOGLE,
    MICROSOFT,
    GUEST
}
