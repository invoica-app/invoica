package com.invoicer.repository

import com.invoicer.entity.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since AND u.isGuest = false")
    fun countActiveUsersSince(since: LocalDateTime): Long

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    fun searchUsers(query: String, pageable: Pageable): Page<User>
}
