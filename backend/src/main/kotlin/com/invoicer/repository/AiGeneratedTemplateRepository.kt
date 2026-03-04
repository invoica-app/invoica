package com.invoicer.repository

import com.invoicer.entity.AiGeneratedTemplate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AiGeneratedTemplateRepository : JpaRepository<AiGeneratedTemplate, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<AiGeneratedTemplate>
    fun findByIdAndUserId(id: Long, userId: Long): AiGeneratedTemplate?
}
