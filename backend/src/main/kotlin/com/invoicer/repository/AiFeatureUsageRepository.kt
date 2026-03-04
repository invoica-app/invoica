package com.invoicer.repository

import com.invoicer.entity.AiFeatureUsage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AiFeatureUsageRepository : JpaRepository<AiFeatureUsage, Long> {
    fun countByUserIdAndFeatureAndSuccessTrue(userId: Long, feature: String): Long
}
