package com.invoicer.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "ai_generated_templates")
class AiGeneratedTemplate(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long = 0,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(name = "analysis_json", nullable = false, columnDefinition = "jsonb")
    var analysisJson: String = "",

    @Column(name = "sample_image_url", columnDefinition = "TEXT")
    var sampleImageUrl: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is AiGeneratedTemplate) return false
        return id != 0L && id == other.id
    }

    override fun hashCode(): Int = javaClass.hashCode()
}
