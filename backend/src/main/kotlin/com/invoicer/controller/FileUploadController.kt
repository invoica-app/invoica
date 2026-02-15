package com.invoicer.controller

import com.invoicer.service.S3Service
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

data class FileUploadResponse(
    val url: String,
    val fileName: String
)

@RestController
@RequestMapping("/api/upload")
class FileUploadController(
    private val s3Service: S3Service
) {

    @PostMapping("/logo")
    fun uploadLogo(@RequestParam("file") file: MultipartFile): ResponseEntity<FileUploadResponse> {
        // Validate file
        if (file.isEmpty) {
            throw IllegalArgumentException("File is empty")
        }

        // Validate file type
        val contentType = file.contentType ?: ""
        if (!contentType.startsWith("image/")) {
            throw IllegalArgumentException("Only image files are allowed")
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw IllegalArgumentException("File size must be less than 5MB")
        }

        val url = s3Service.uploadFile(file, "logos")

        return ResponseEntity.ok(
            FileUploadResponse(
                url = url,
                fileName = file.originalFilename ?: "logo"
            )
        )
    }
}
