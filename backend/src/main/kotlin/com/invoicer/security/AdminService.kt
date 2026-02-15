package com.invoicer.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class AdminService {

    @Value("\${admin.emails:}")
    private lateinit var adminEmails: String

    fun isAdmin(email: String): Boolean {
        if (adminEmails.isBlank()) return false
        return adminEmails.split(",").map { it.trim().lowercase() }.contains(email.lowercase())
    }
}
