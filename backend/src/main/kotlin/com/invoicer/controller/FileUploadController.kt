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

        if (file.size > 5 * 1024 * 1024) {
            throw IllegalArgumentException("File size must be less than 5MB")
        }

        // Validate actual file content via magic bytes, not client-supplied Content-Type
        val bytes = file.bytes
        if (!isValidImage(bytes)) {
            throw IllegalArgumentException("Only PNG and JPEG files are allowed")
        }

        val url = storageService.uploadFile(file, "logos")

        return ResponseEntity.ok(
            FileUploadResponse(
                url = url,
                fileName = file.originalFilename ?: "logo"
            )
        )
    }

    private fun isValidImage(bytes: ByteArray): Boolean {
        if (bytes.size < 4) return false
        // PNG: 89 50 4E 47
        val isPng = bytes[0] == 0x89.toByte() && bytes[1] == 0x50.toByte() &&
                bytes[2] == 0x4E.toByte() && bytes[3] == 0x47.toByte()
        // JPEG: FF D8 FF
        val isJpeg = bytes[0] == 0xFF.toByte() && bytes[1] == 0xD8.toByte() &&
                bytes[2] == 0xFF.toByte()
        return isPng || isJpeg
    }
}
