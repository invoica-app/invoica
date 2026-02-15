package com.invoicer.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    var email: String = "",

    @Column(nullable = false)
    var name: String = "",

    @Column(name = "provider")
    @Enumerated(EnumType.STRING)
    var provider: AuthProvider = AuthProvider.GUEST,

    @Column(name = "provider_id")
    var providerId: String? = null,

    @Column(name = "is_guest")
    var isGuest: Boolean = false,

    @Column(name = "is_disabled")
    var isDisabled: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is User) return false
        return id != 0L && id == other.id
    }

    override fun hashCode(): Int = javaClass.hashCode()
}

enum class AuthProvider {
    GOOGLE,
    MICROSOFT,
    GUEST
}
