package com.invoicer.controller

import com.invoicer.service.StorageService
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
    private val storageService: StorageService
) {

    @PostMapping("/logo")
    fun uploadLogo(@RequestParam("file") file: MultipartFile): ResponseEntity<FileUploadResponse> {
        if (file.isEmpty) {
            throw IllegalArgumentException("File is empty")
        }

        val allowedTypes = listOf("image/png", "image/jpeg")
        if (file.contentType !in allowedTypes) {
            throw IllegalArgumentException("Only PNG and JPEG files are allowed")
        }

        if (file.size > 5 * 1024 * 1024) {
            throw IllegalArgumentException("File size must be less than 5MB")
        }

        val url = storageService.uploadFile(file, "logos")

        return ResponseEntity.ok(
            FileUploadResponse(
                url = url,
                fileName = file.originalFilename ?: "logo"
            )
        )
    }
}
